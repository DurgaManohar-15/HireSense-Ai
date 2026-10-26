package com.hiresense.modules.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiresense.modules.interview.dto.InterviewFinalReportDto;
import com.hiresense.modules.interview.dto.InterviewQuestionDto;
import com.hiresense.modules.interview.dto.TurnEvaluationDto;
import com.hiresense.modules.interview.dto.TurnReviewDto;
import com.hiresense.modules.interview.model.InterviewDifficulty;
import com.hiresense.modules.interview.model.InterviewType;
import com.hiresense.modules.resume.dto.ResumeAnalysisResultDto;
import com.hiresense.modules.interview.service.TopicModelAnswerGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Service("geminiAIService")
@RequiredArgsConstructor
public class GeminiAIService implements AIService {

    private final ObjectMapper objectMapper;
    private final HeuristicResumeAnalyzer heuristicAnalyzer;
    private final TopicModelAnswerGenerator topicModelAnswerGenerator;
    private final com.hiresense.modules.intelligence.service.JdSkillGapCalibrationEngine calibrationEngine;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${hiresense.ai.gemini.api-key:}")
    private String apiKey;

    @Value("${hiresense.ai.gemini.model:gemini-3.6-flash}")
    private String modelName;

    @Override
    public ResumeAnalysisResultDto analyzeResume(String sanitizedResumeText, String targetRole, String targetCompany) {
        return analyzeResume(sanitizedResumeText, targetRole, targetCompany, null);
    }

    @Override
    public ResumeAnalysisResultDto analyzeResume(String sanitizedResumeText, String targetRole, String targetCompany, String jobDescription) {
        if (isApiKeyUnset()) {
            log.warn("Gemini API key is unconfigured. Utilizing heuristic resume diagnostic fallback.");
            return heuristicAnalyzer.analyze(sanitizedResumeText, targetRole, targetCompany, jobDescription);
        }

        try {
            // First run deterministic evaluation
            ResumeAnalysisResultDto deterministicDto = heuristicAnalyzer.analyze(sanitizedResumeText, targetRole, targetCompany, jobDescription);

            String prompt = ResumeAnalysisPromptTemplate.SYSTEM_INSTRUCTION + "\n\n" +
                    ResumeAnalysisPromptTemplate.buildUserPrompt(targetRole, targetCompany, sanitizedResumeText);

            String cleanJson = callGeminiApi(prompt);
            ResumeAnalysisResultDto llmDto = objectMapper.readValue(cleanJson, ResumeAnalysisResultDto.class);

            // Merge qualitative feedback from LLM into deterministic framework
            if (llmDto.getTargetRoleMatchSummary() != null && !llmDto.getTargetRoleMatchSummary().isBlank()) {
                deterministicDto.setTargetRoleMatchSummary(llmDto.getTargetRoleMatchSummary());
            }
            if (llmDto.getStrengths() != null && !llmDto.getStrengths().isEmpty()) {
                deterministicDto.setStrengths(llmDto.getStrengths());
            }
            if (llmDto.getWeaknesses() != null && !llmDto.getWeaknesses().isEmpty()) {
                deterministicDto.setWeaknesses(llmDto.getWeaknesses());
            }
            if (llmDto.getRecommendations() != null && !llmDto.getRecommendations().isEmpty()) {
                deterministicDto.setRecommendations(llmDto.getRecommendations());
            }

            return deterministicDto;
        } catch (Exception e) {
            log.error("Gemini API call failed for resume analysis: {}. Utilizing heuristic fallback.", e.getMessage());
            return heuristicAnalyzer.analyze(sanitizedResumeText, targetRole, targetCompany, jobDescription);
        }
    }

    @Override
    public InterviewQuestionDto generateInterviewQuestion(
            InterviewType type,
            InterviewDifficulty difficulty,
            String targetRole,
            String targetCompany,
            String topic,
            int sequenceNumber,
            int totalQuestions,
            String candidateSkills,
            String projectSummary,
            String previousQuestion,
            String previousAnswer,
            Integer previousTurnScore
    ) {
        if (isApiKeyUnset()) {
            log.warn("Gemini API key unconfigured. Generating topic-tailored fallback question.");
            return createMockQuestionFallback(type, sequenceNumber, difficulty, targetRole, topic);
        }

        try {
            String prompt = InterviewPromptTemplate.QUESTION_GEN_SYSTEM_INSTRUCTION + "\n\n" +
                    InterviewPromptTemplate.buildQuestionPrompt(
                            type, difficulty, targetRole, targetCompany, topic, sequenceNumber, totalQuestions,
                            candidateSkills, projectSummary, previousQuestion, previousAnswer, previousTurnScore
                    );

            String cleanJson = callGeminiApi(prompt);
            InterviewQuestionDto dto = objectMapper.readValue(cleanJson, InterviewQuestionDto.class);
            dto.setSequenceNumber(sequenceNumber);
            if (dto.getTopic() == null || dto.getTopic().isBlank()) {
                dto.setTopic(topic != null && !topic.isBlank() ? topic : "Technical Assessment");
            }
            dto.setCategory(type == InterviewType.HR_BEHAVIORAL ? "HR" : (type == InterviewType.PROJECT_DEEP_DIVE ? "PROJECT" : "TECHNICAL"));
            if (dto.getDifficulty() == null) dto.setDifficulty(difficulty == InterviewDifficulty.ADAPTIVE ? InterviewDifficulty.MEDIUM : difficulty);
            return dto;
        } catch (Exception e) {
            log.error("Gemini question generation failed: {}. Generating topic-tailored fallback question.", e.getMessage());
            return createMockQuestionFallback(type, sequenceNumber, difficulty, targetRole, topic);
        }
    }

    @Override
    public TurnEvaluationDto evaluateInterviewAnswer(
            String questionText,
            String topic,
            InterviewDifficulty difficulty,
            String candidateAnswer
    ) {
        // Immediate Zero-Tolerance Check for empty, silence, or non-answers
        if (isNonAnswer(candidateAnswer)) {
            log.info("Detected blank/silent response for question '{}'. Evaluating to 0.", questionText);
            return createZeroEvaluation(topic, questionText, difficulty);
        }

        if (isApiKeyUnset()) {
            log.warn("Gemini API key unconfigured. Generating topic-aware evaluation fallback.");
            return createMockEvaluationFallback(candidateAnswer, topic, questionText, difficulty);
        }

        try {
            String prompt = InterviewPromptTemplate.ANSWER_EVAL_SYSTEM_INSTRUCTION + "\n\n" +
                    InterviewPromptTemplate.buildAnswerEvalPrompt(questionText, topic, difficulty, candidateAnswer);

            String cleanJson = callGeminiApi(prompt);
            TurnEvaluationDto dto = objectMapper.readValue(cleanJson, TurnEvaluationDto.class);

            // Ensure model answers & examples are populated
            if (dto.getModelAnswer() == null || dto.getModelAnswer().isBlank()) {
                TopicModelAnswerGenerator.ModelAnswerResult res = topicModelAnswerGenerator.generate(topic, questionText, difficulty);
                dto.setModelAnswer(res.modelAnswer);
                if (dto.getPracticalExample() == null || dto.getPracticalExample().isBlank()) {
                    dto.setPracticalExample(res.practicalExample);
                }
                if (dto.getKeyTakeaways() == null || dto.getKeyTakeaways().isEmpty()) {
                    dto.setKeyTakeaways(res.keyTakeaways);
                }
            }

            // Bounds checks & calculation
            clampScores(dto);
            return dto;
        } catch (Exception e) {
            log.error("Gemini answer evaluation failed: {}. Generating topic-aware evaluation fallback.", e.getMessage());
            return createMockEvaluationFallback(candidateAnswer, topic, questionText, difficulty);
        }
    }

    @Override
    public InterviewFinalReportDto generateFinalInterviewReport(
            InterviewType type,
            String targetRole,
            String targetCompany,
            List<TurnReviewDto> turnReviews
    ) {
        if (isApiKeyUnset() || turnReviews.isEmpty()) {
            log.warn("Gemini API key unconfigured. Generating fallback mock final report.");
            return createMockReportFallback(type, targetRole, targetCompany, turnReviews);
        }

        try {
            StringBuilder reviewSummary = new StringBuilder();
            int sumScores = 0;
            for (TurnReviewDto t : turnReviews) {
                sumScores += t.getEvaluation() != null ? t.getEvaluation().getOverallTurnScore() : 70;
                reviewSummary.append(String.format("- Q: %s | Answer: %s | Turn Score: %d\n",
                        t.getQuestionText(), t.getAnswerText(), t.getEvaluation() != null ? t.getEvaluation().getOverallTurnScore() : 70));
            }

            String prompt = InterviewPromptTemplate.FINAL_REPORT_SYSTEM_INSTRUCTION + "\n\n" +
                    String.format("[INTERVIEW SUMMARY]\nType: %s\nRole: %s\nCompany: %s\n\n[TURNS]\n%s",
                            type.name(), targetRole, targetCompany, reviewSummary);

            String cleanJson = callGeminiApi(prompt);
            InterviewFinalReportDto dto = objectMapper.readValue(cleanJson, InterviewFinalReportDto.class);

            if (dto.getOverallScore() == null) dto.setOverallScore(sumScores / turnReviews.size());
            if (dto.getOverallScore() > 100) dto.setOverallScore(100);
            if (dto.getOverallScore() < 0) dto.setOverallScore(0);
            return dto;
        } catch (Exception e) {
            log.error("Gemini final report generation failed: {}. Utilizing fallback report.", e.getMessage());
            return createMockReportFallback(type, targetRole, targetCompany, turnReviews);
        }
    }

    @Override
    public com.hiresense.modules.assistant.dto.CareerAssistantDtos.ChatResponse chatCareerAssistant(
            String userMessage,
            String targetRole,
            String targetCompany,
            int prsScore,
            int confidence,
            String readinessBand,
            String strongestArea,
            String biggestOpportunity,
            List<String> topGaps,
            String roadmapProgress,
            List<com.hiresense.modules.assistant.dto.CareerAssistantDtos.MessageDto> recentHistory
    ) {
        if (isApiKeyUnset()) {
            log.warn("Gemini API key is unconfigured. Generating fallback career advisory response.");
            return createMockAssistantFallback(userMessage, targetRole, targetCompany, prsScore, confidence, readinessBand, strongestArea, biggestOpportunity, topGaps, roadmapProgress);
        }

        try {
            String prompt = CareerAssistantPromptTemplate.SYSTEM_INSTRUCTION + "\n\n" +
                    CareerAssistantPromptTemplate.buildPrompt(
                            userMessage, targetRole, targetCompany, prsScore, confidence,
                            readinessBand, strongestArea, biggestOpportunity, topGaps, roadmapProgress, recentHistory
                    );

            String cleanJson = callGeminiApi(prompt);
            JsonNode root = objectMapper.readTree(cleanJson);

            String reply = root.path("assistantReply").asText(null);
            if (reply == null || reply.isBlank()) {
                reply = cleanJson;
            }

            List<String> evidenceSources = new ArrayList<>();
            JsonNode evNode = root.path("evidenceSources");
            if (evNode.isArray()) {
                for (JsonNode n : evNode) evidenceSources.add(n.asText());
            }
            if (evidenceSources.isEmpty()) {
                evidenceSources.add("Gemini AI Intelligence");
                evidenceSources.add("Placement Readiness Intelligence");
            }

            List<String> suggestions = new ArrayList<>();
            JsonNode sugNode = root.path("actionSuggestions");
            if (sugNode.isArray()) {
                for (JsonNode n : sugNode) suggestions.add(n.asText());
            }
            if (suggestions.isEmpty()) {
                suggestions.add("Practice technical concepts aligned with your roadmap.");
                suggestions.add("Take a diagnostic mock interview to evaluate progress.");
            }

            return com.hiresense.modules.assistant.dto.CareerAssistantDtos.ChatResponse.builder()
                    .assistantReply(reply)
                    .evidenceSources(evidenceSources)
                    .actionSuggestions(suggestions)
                    .aiProvider("GOOGLE_GEMINI")
                    .timestamp(java.time.Instant.now())
                    .build();
        } catch (Exception e) {
            log.error("Gemini API call failed for Career Assistant: {}. Utilizing fallback response.", e.getMessage());
            return createMockAssistantFallback(userMessage, targetRole, targetCompany, prsScore, confidence, readinessBand, strongestArea, biggestOpportunity, topGaps, roadmapProgress);
        }
    }

    @Override
    public String getProviderName() {
        return "GEMINI";
    }

    @Override
    public String getModelName() {
        return modelName;
    }

    // Helper to call Gemini REST API and sanitize response
    private String callGeminiApi(String prompt) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;

        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> contentPart = Map.of("parts", Collections.singletonList(textPart));
        Map<String, Object> requestBody = Map.of(
                "contents", Collections.singletonList(contentPart),
                "generationConfig", Map.of(
                        "temperature", 0.2,
                        "responseMimeType", "application/json"
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                String rawJson = candidates.get(0)
                        .path("content")
                        .path("parts")
                        .get(0)
                        .path("text")
                        .asText();

                String cleanJson = rawJson.trim();
                if (cleanJson.startsWith("```json")) cleanJson = cleanJson.substring(7);
                else if (cleanJson.startsWith("```")) cleanJson = cleanJson.substring(3);
                if (cleanJson.endsWith("```")) cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
                return cleanJson.trim();
            }
        }
        throw new RuntimeException("Empty or malformed payload received from Gemini API");
    }

    private boolean isApiKeyUnset() {
        return apiKey == null || apiKey.trim().isEmpty() || "YOUR_GEMINI_API_KEY".equals(apiKey);
    }

    private void clampScores(TurnEvaluationDto dto) {
        if (dto.getRelevanceScore() == null) dto.setRelevanceScore(70);
        if (dto.getTechnicalCorrectnessScore() == null) dto.setTechnicalCorrectnessScore(70);
        if (dto.getCompletenessScore() == null) dto.setCompletenessScore(70);
        if (dto.getClarityScore() == null) dto.setClarityScore(70);
        if (dto.getCommunicationScore() == null) dto.setCommunicationScore(70);
        if (dto.getOverallTurnScore() == null) {
            int weighted = (int) Math.round(
                    (dto.getRelevanceScore() * 0.25) +
                            (dto.getTechnicalCorrectnessScore() * 0.35) +
                            (dto.getCompletenessScore() * 0.20) +
                            (dto.getClarityScore() * 0.10) +
                            (dto.getCommunicationScore() * 0.10)
            );
            dto.setOverallTurnScore(weighted);
        }
    }

    private boolean isNonAnswer(String answer) {
        if (answer == null) return true;
        String clean = answer.trim().toLowerCase();
        if (clean.isEmpty() || clean.equals("...") || clean.equals(".") || clean.equals("silent")) return true;
        if (clean.contains("no response within the allotted time") || clean.contains("candidate provided no response") || clean.contains("no response recorded")) return true;
        if (clean.contains("don't know") || clean.contains("dont know") || clean.contains("do not know") ||
            clean.contains("no idea") || clean.contains("not sure") || clean.contains("have no idea") ||
            clean.contains("no clue") || clean.contains("cannot answer") || clean.contains("can't answer") ||
            clean.equals("skip") || clean.equals("pass") || clean.equals("no answer")) {
            String[] words = clean.split("\\s+");
            if (words.length < 15) return true;
        }
        String[] words = clean.split("\\s+");
        return words.length < 3 && !clean.contains("class") && !clean.contains("tree") && !clean.contains("map") && !clean.contains("api") && !clean.contains("sql") && !clean.contains("http") && !clean.contains("thread");
    }

    private TurnEvaluationDto createZeroEvaluation(String topic, String questionText, InterviewDifficulty diff) {
        TopicModelAnswerGenerator.ModelAnswerResult modelRes = topicModelAnswerGenerator.generate(topic, questionText, diff != null ? diff : InterviewDifficulty.MEDIUM);
        return TurnEvaluationDto.builder()
                .relevanceScore(0)
                .technicalCorrectnessScore(0)
                .completenessScore(0)
                .clarityScore(0)
                .communicationScore(0)
                .overallTurnScore(0)
                .strengths(List.of())
                .weaknesses(List.of("Candidate provided no substantive answer or indicated lack of knowledge for this question."))
                .improvementSuggestions(List.of("Review the simple model answer and code example below to prepare for this question."))
                .suggestedFollowUpTopic("Core Subject Review")
                .modelAnswer(modelRes.modelAnswer)
                .practicalExample(modelRes.practicalExample)
                .keyTakeaways(modelRes.keyTakeaways)
                .build();
    }

    private InterviewQuestionDto createMockQuestionFallback(InterviewType type, int seq, InterviewDifficulty diff, String role, String topic) {
        String effectiveTopic = (topic != null && !topic.isBlank()) ? topic.trim() : "Software Engineering";
        String questionText;
        String subtopic = effectiveTopic;

        if (diff == InterviewDifficulty.EASY) {
            switch (seq % 5) {
                case 1 -> {
                    questionText = String.format("What are the fundamental concepts, core definitions, and primary purpose of %s?", effectiveTopic);
                    subtopic = effectiveTopic + " Fundamentals";
                }
                case 2 -> {
                    questionText = String.format("Can you explain the standard syntax, lifecycle, or basic workflow when implementing %s?", effectiveTopic);
                    subtopic = effectiveTopic + " Basic Workflow";
                }
                case 3 -> {
                    questionText = String.format("What are the primary advantages, features, and common use cases of %s?", effectiveTopic);
                    subtopic = effectiveTopic + " Features & Use Cases";
                }
                case 4 -> {
                    questionText = String.format("What are the basic data types, interfaces, or building blocks that %s relies on?", effectiveTopic);
                    subtopic = effectiveTopic + " Core Building Blocks";
                }
                default -> {
                    questionText = String.format("Can you provide a simple code or design example illustrating how %s solves a typical programming requirement?", effectiveTopic);
                    subtopic = effectiveTopic + " Example Implementation";
                }
            }
        } else if (diff == InterviewDifficulty.HARD) { // IN_DEPTH
            switch (seq % 5) {
                case 1 -> {
                    questionText = String.format("In deep technical terms, how does %s work internally under the hood? Walk through its memory model, data structures, and runtime pipeline.", effectiveTopic);
                    subtopic = effectiveTopic + " Internal Architecture";
                }
                case 2 -> {
                    questionText = String.format("How does %s behave under high concurrency, race conditions, and thread contention? What locking or synchronization guarantees exist?", effectiveTopic);
                    subtopic = effectiveTopic + " Concurrency & Race Conditions";
                }
                case 3 -> {
                    questionText = String.format("What are the critical performance bottlenecks, memory leaks, or garbage collection overheads associated with %s at high throughput?", effectiveTopic);
                    subtopic = effectiveTopic + " Performance & Memory Bottlenecks";
                }
                case 4 -> {
                    questionText = String.format("How would you architect and optimize %s in a distributed system to handle failover, data consistency, and low-latency scaling?", effectiveTopic);
                    subtopic = effectiveTopic + " Distributed Scalability & Failover";
                }
                default -> {
                    questionText = String.format("Describe a complex debugging scenario or catastrophic edge-case failure involving %s, and how you would diagnose and resolve it.", effectiveTopic);
                    subtopic = effectiveTopic + " Edge Cases & Diagnostics";
                }
            }
        } else { // MEDIUM (Standard Campus Placement)
            switch (seq % 5) {
                case 1 -> {
                    questionText = String.format("Explain the core architecture, key principles, and standard design patterns utilized when working with %s in %s.", effectiveTopic, (role != null ? role : "software engineering"));
                    subtopic = effectiveTopic + " Architecture & Patterns";
                }
                case 2 -> {
                    questionText = String.format("What are the time and space complexity trade-offs, internal hashing/indexing mechanics, or memory efficiency considerations in %s?", effectiveTopic);
                    subtopic = effectiveTopic + " Complexity & Efficiency Trade-offs";
                }
                case 3 -> {
                    questionText = String.format("How do you handle error management, exception propagation, and transaction safety when implementing %s in production?", effectiveTopic);
                    subtopic = effectiveTopic + " Error Handling & Validation";
                }
                case 4 -> {
                    questionText = String.format("Compare %s with its most prominent alternatives. What architectural factors determine when to choose one over the other?", effectiveTopic);
                    subtopic = effectiveTopic + " Comparative Trade-offs";
                }
                default -> {
                    questionText = String.format("Explain how you would write unit and integration tests to verify the reliability and edge cases of a module built with %s.", effectiveTopic);
                    subtopic = effectiveTopic + " Testing & Quality Assurance";
                }
            }
        }

        return InterviewQuestionDto.builder()
                .sequenceNumber(seq)
                .category(type == InterviewType.HR_BEHAVIORAL ? "HR" : (type == InterviewType.PROJECT_DEEP_DIVE ? "PROJECT" : "TECHNICAL"))
                .topic(subtopic)
                .difficulty(diff == InterviewDifficulty.ADAPTIVE ? InterviewDifficulty.MEDIUM : diff)
                .questionText(questionText)
                .contextRationale(String.format("Topic-specific evaluation question for %s at %s depth.", subtopic, diff))
                .build();
    }

    private TurnEvaluationDto createMockEvaluationFallback(String answer, String topic, String questionText, InterviewDifficulty diff) {
        if (isNonAnswer(answer)) {
            return createZeroEvaluation(topic, questionText, diff);
        }

        TopicModelAnswerGenerator.ModelAnswerResult modelRes = topicModelAnswerGenerator.generate(topic, questionText, diff != null ? diff : InterviewDifficulty.MEDIUM);

        int words = answer.trim().split("\\s+").length;
        int relevance;
        int technical;
        int completeness;
        int clarity;
        int communication;

        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        if (words < 10) {
            relevance = 25;
            technical = 20;
            completeness = 15;
            clarity = 30;
            communication = 30;
            weaknesses.add("Answer is extremely brief (< 10 words) and lacks technical depth.");
            suggestions.add("Elaborate with concrete definitions, implementation patterns, and practical code-level examples.");
        } else if (words < 25) {
            relevance = 60;
            technical = 55;
            completeness = 50;
            clarity = 65;
            communication = 60;
            strengths.add("Identified basic concepts relevant to " + (topic != null ? topic : "the topic") + ".");
            weaknesses.add("Lacks in-depth explanation of internal mechanisms and edge case handling.");
            suggestions.add("Add details about memory management, time complexities, and architectural trade-offs.");
        } else if (words < 50) {
            relevance = 80;
            technical = 78;
            completeness = 75;
            clarity = 82;
            communication = 80;
            strengths.add("Clear, structured explanation covering fundamental mechanics and use cases.");
            weaknesses.add("Could strengthen discussion on production scalability and failure recovery.");
            suggestions.add("Discuss how this performs under high concurrency or distributed environments.");
        } else {
            relevance = 92;
            technical = 90;
            completeness = 88;
            clarity = 90;
            communication = 88;
            strengths.add("Comprehensive, articulate response with deep technical terminology and clear reasoning.");
            strengths.add("Effectively covered implementation trade-offs and best practices.");
            suggestions.add("Maintain this level of structured articulation in live campus technical rounds.");
        }

        int overall = (int) Math.round((relevance * 0.25) + (technical * 0.35) + (completeness * 0.20) + (clarity * 0.10) + (communication * 0.10));

        return TurnEvaluationDto.builder()
                .relevanceScore(relevance)
                .technicalCorrectnessScore(technical)
                .completenessScore(completeness)
                .clarityScore(clarity)
                .communicationScore(communication)
                .overallTurnScore(overall)
                .strengths(strengths)
                .weaknesses(weaknesses)
                .improvementSuggestions(suggestions)
                .suggestedFollowUpTopic((topic != null ? topic : "Subject") + " Mechanics")
                .modelAnswer(modelRes.modelAnswer)
                .practicalExample(modelRes.practicalExample)
                .keyTakeaways(modelRes.keyTakeaways)
                .build();
    }

    private InterviewFinalReportDto createMockReportFallback(InterviewType type, String role, String company, List<TurnReviewDto> turns) {
        int avg = turns.isEmpty() ? 0 : turns.stream().mapToInt(t -> t.getEvaluation() != null ? t.getEvaluation().getOverallTurnScore() : 70).sum() / turns.size();
        return InterviewFinalReportDto.builder()
                .overallScore(avg)
                .technicalScore(avg)
                .behavioralScore(avg)
                .communicationScore(avg)
                .summaryEvaluation("Candidate completed the interview evaluation successfully.")
                .keyStrengths(List.of("Consistent clarity and steady composure across all interview questions."))
                .keyWeaknesses(List.of("Include more quantifiable technical metrics in complex problem-solving scenarios."))
                .topicsToImprove(List.of("System Architecture", "Concurrency Optimization"))
                .actionableRoadmapSuggestions(List.of("Review STAR framework for situational behavioral questions."))
                .build();
    }

    private com.hiresense.modules.assistant.dto.CareerAssistantDtos.ChatResponse createMockAssistantFallback(
            String userMessage,
            String targetRole,
            String targetCompany,
            int prsScore,
            int confidence,
            String readinessBand,
            String strongestArea,
            String biggestOpportunity,
            List<String> topGaps,
            String roadmapProgress
    ) {
        String query = userMessage != null ? userMessage.toLowerCase().trim() : "";
        String role = targetRole != null ? targetRole : "Software Engineer";
        String company = targetCompany != null ? targetCompany : "General Tech";
        String band = readinessBand != null ? readinessBand : "Initial Stage";
        String strength = strongestArea != null ? strongestArea : "Technical Foundation";
        String opportunity = biggestOpportunity != null ? biggestOpportunity : "Core Problem Solving";
        String gapsFormatted = topGaps != null && !topGaps.isEmpty() ? String.join(", ", topGaps) : "None detected";

        String reply;
        List<String> evidence = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        com.hiresense.modules.assistant.dto.CareerAssistantDtos.AssessmentRecommendationDto assessmentRec = null;

        if (query.contains("assessment") || query.contains("test") || query.contains("quiz") || 
            query.contains("conduct") || query.contains("mcq") || query.contains("evaluate my") || 
            query.contains("exam") || query.contains("practice") || query.contains("question") ||
            query.contains("ask") || query.contains("topic")) {
            
            List<String> detectedTopics = new ArrayList<>();
            if (query.contains("java")) detectedTopics.add("Java");
            if (query.contains("oop") || query.contains("object oriented")) detectedTopics.add("OOP");
            if (query.contains("dbms") || query.contains("database") || query.contains("sql")) detectedTopics.add("DBMS");
            if (query.contains("operating system") || query.contains(" os ") || query.endsWith(" os") || query.startsWith("os ")) detectedTopics.add("Operating Systems");
            if (query.contains("network") || query.contains("cn")) detectedTopics.add("Computer Networks");
            if (query.contains("dsa") || query.contains("data structure") || query.contains("algorithm")) detectedTopics.add("DSA");
            if (query.contains("aptitude") || query.contains("percentage") || query.contains("probability") || query.contains("math")) detectedTopics.add("Aptitude");
            if (query.contains("reasoning") || query.contains("syllogism") || query.contains("series") || query.contains("logic")) detectedTopics.add("Logical Reasoning");
            if (query.contains("verbal") || query.contains("english") || query.contains("grammar")) detectedTopics.add("Verbal Ability");
            if (query.contains("python")) detectedTopics.add("Python");
            if (query.contains("c++") || query.contains("cpp")) detectedTopics.add("C++");

            if (detectedTopics.isEmpty()) {
                java.util.regex.Matcher tm = java.util.regex.Pattern.compile("(?:on|about|for|topic)\\s+([a-zA-Z0-9+#]+)").matcher(query);
                if (tm.find()) {
                    String extracted = tm.group(1).trim();
                    if (!extracted.equalsIgnoreCase("the") && !extracted.equalsIgnoreCase("me") && !extracted.equalsIgnoreCase("an") && !extracted.equalsIgnoreCase("a")) {
                        detectedTopics.add(Character.toUpperCase(extracted.charAt(0)) + extracted.substring(1).toLowerCase());
                    }
                }
            }

            int requestedCount = 15;
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("(\\d+)\\s*(?:questions?|mcqs?|q)").matcher(query);
            if (m.find()) {
                try {
                    requestedCount = Integer.parseInt(m.group(1));
                    if (requestedCount < 5) requestedCount = 5;
                    if (requestedCount > 30) requestedCount = 30;
                } catch (Exception ignored) {}
            }

            String diff = "MEDIUM";
            if (query.contains("easy")) diff = "EASY";
            else if (query.contains("hard")) diff = "HARD";
            else if (query.contains("mixed")) diff = "MIXED";

            if (detectedTopics.isEmpty()) {
                if (topGaps != null && !topGaps.isEmpty()) {
                    String gapName = topGaps.get(0).split("\\s+")[0].replaceAll("[^a-zA-Z]", "");
                    if (gapName.equalsIgnoreCase("DBMS") || gapName.equalsIgnoreCase("Database") || gapName.equalsIgnoreCase("SQL")) {
                        detectedTopics.add("DBMS");
                    } else if (gapName.equalsIgnoreCase("Java")) {
                        detectedTopics.add("Java");
                    } else if (gapName.equalsIgnoreCase("OOP")) {
                        detectedTopics.add("OOP");
                    } else if (gapName.equalsIgnoreCase("OS") || gapName.equalsIgnoreCase("Operating")) {
                        detectedTopics.add("Operating Systems");
                    } else if (gapName.equalsIgnoreCase("Network") || gapName.equalsIgnoreCase("Networks")) {
                        detectedTopics.add("Computer Networks");
                    } else if (gapName.equalsIgnoreCase("DSA") || gapName.equalsIgnoreCase("Algorithms")) {
                        detectedTopics.add("DSA");
                    } else {
                        detectedTopics.add(gapName.isEmpty() ? "Java" : gapName);
                    }
                } else if (opportunity != null && !opportunity.isBlank() && !opportunity.equalsIgnoreCase("Core Problem Solving") && !opportunity.equalsIgnoreCase("Technical Foundation")) {
                    detectedTopics.add(opportunity);
                } else {
                    detectedTopics.add("Java");
                    detectedTopics.add("OOP");
                }
            }

            String topicsDisplay = String.join(", ", detectedTopics);
            assessmentRec = com.hiresense.modules.assistant.dto.CareerAssistantDtos.AssessmentRecommendationDto.builder()
                    .topics(detectedTopics)
                    .category("CORE_CS_TECHNICAL")
                    .difficulty(diff)
                    .questionCount(requestedCount)
                    .durationMinutes(requestedCount * 2)
                    .rationale("Personalized based on your " + role + " benchmark and current skill gaps.")
                    .targetRole(role)
                    .targetCompany(company)
                    .build();

            reply = String.format(
                    "I recommend a **%d-question %s-level assessment** on **%s** for your **%s** preparation at **%s**.\n\n" +
                    "📝 **Assessment Configuration Plan:**\n" +
                    "- **Topics:** %s\n" +
                    "- **Difficulty:** %s\n" +
                    "- **Question Count:** %d Questions (~%d mins)\n" +
                    "- **Benchmark Context:** Calibrated for %s hiring standards\n\n" +
                    "Click **Confirm & Configure Assessment** below to review settings or customize before starting!",
                    requestedCount, diff, topicsDisplay, role, company,
                    topicsDisplay, diff, requestedCount, requestedCount * 2, company
            );

            evidence.add("Skill Gap Calibration");
            evidence.add("Target Company Benchmark: " + company);
            suggestions.add("Start " + topicsDisplay + " Assessment (" + requestedCount + " Questions)");
            suggestions.add("Adjust Topics or Difficulty");
        } else if (query.matches("^(hi|hello|hey|greetings|hola|good morning|good afternoon|good evening).*") || query.equals("hello") || query.equals("hi")) {
            reply = String.format(
                    "Hello! 👋 I am your **HireSense Career Intelligence Advisor**.\n\n" +
                    "I'm here to help you prepare for your target role of **%s** at **%s**.\n\n" +
                    "📊 **Your Placement Snapshot:**\n" +
                    "- **Placement Readiness Score (PRS):** %d/100 (%s)\n" +
                    "- **Assessment Confidence:** %d%%\n" +
                    "- **Verified Strength:** %s\n" +
                    "- **Primary Growth Focus:** %s\n\n" +
                    "Ask me anything about your score, interview preparation, algorithms, or study plan!",
                    role, company, prsScore, band, confidence, strength, opportunity
            );
            evidence.add("Placement Readiness Intelligence");
            evidence.add("Student Profile Context");
            suggestions.add("Ask: 'What should I improve first to maximize my PRS score?'");
            suggestions.add("Ask: 'What should I study today based on my roadmap?'");
        } else if (query.contains("improve") || query.contains("weak") || query.contains("focus") || query.contains("prepare for")) {
            reply = String.format(
                    "Based on your latest Placement Readiness Score of **%d/100 (%s)**, your primary improvement focus should be in **%s**.\n\n" +
                    "🔍 **Key Gap Breakdown for %s:**\n" +
                    "- **Identified Benchmark Gaps:** %s\n" +
                    "- **Assessment Confidence:** %d%%\n\n" +
                    "💡 **Recommended Strategy:**\n" +
                    "1. Focus your study sessions on your top gap areas (%s).\n" +
                    "2. Complete today's assigned tasks in your **Preparation Roadmap** (%s completed).\n" +
                    "3. Validate your progress by taking targeted diagnostic quizzes.",
                    prsScore, band, opportunity, company, gapsFormatted, confidence,
                    topGaps != null && !topGaps.isEmpty() ? topGaps.get(0) : opportunity,
                    roadmapProgress != null ? roadmapProgress : "0/0"
            );
            evidence.add("Skill Gap Engine");
            evidence.add("Company Benchmark Comparison");
            suggestions.add("Complete today's assigned modules in your Preparation Roadmap.");
            suggestions.add("Take a diagnostic quiz on " + opportunity + ".");
        } else {
            reply = String.format(
                    "Regarding **\"%s\"** for your **%s** preparation at **%s**:\n\n" +
                    "Your current verified baseline is **%d/100 PRS (%s)** with verified strength in **%s**.\n\n" +
                    "To excel in campus placement drives:\n" +
                    "- Systematically bridge active gaps in **%s**.\n" +
                    "- Maintain consistent daily roadmap execution (%s completed).\n" +
                    "- Participate in turn-by-turn AI mock interviews to build fluency under realistic conditions.",
                    userMessage, role, company, prsScore, band, strength,
                    gapsFormatted, roadmapProgress != null ? roadmapProgress : "in progress"
            );
            evidence.add("HireSense Career Intelligence");
            suggestions.add("Explore related topics in Diagnostic MCQs.");
            suggestions.add("Launch a turn-by-turn Mock Interview session.");
        }

        return com.hiresense.modules.assistant.dto.CareerAssistantDtos.ChatResponse.builder()
                .assistantReply(reply)
                .evidenceSources(evidence)
                .actionSuggestions(suggestions)
                .assessmentRecommendation(assessmentRec)
                .aiProvider("MOCK_FALLBACK")
                .timestamp(java.time.Instant.now())
                .build();
    }

    @Override
    public List<com.hiresense.modules.assessment.model.Question> generateAssessmentQuestions(
            String topic,
            com.hiresense.modules.assessment.model.AssessmentDifficulty difficulty,
            int count
    ) {
        MockAIService fallback = new MockAIService(heuristicAnalyzer, topicModelAnswerGenerator, calibrationEngine);
        return fallback.generateAssessmentQuestions(topic, difficulty, count);
    }

    @Override
    public com.hiresense.modules.intelligence.dto.JdSkillGapAnalysisResponse analyzeJdSkillGaps(
            String knownSkills,
            String jobDescription,
            String targetRole,
            String targetCompany
    ) {
        if (isApiKeyUnset()) {
            log.warn("Gemini API key is unconfigured. Utilizing deterministic multi-domain calibration engine.");
            return calibrationEngine.analyzeJd(knownSkills, jobDescription, targetRole, targetCompany);
        }

        try {
            String prompt = "You are an expert Talent Acquisition & Placement Readiness Intelligence Engine.\n" +
                    "Perform an accurate, objective, and realistic comparative skill gap analysis between the candidate's known competencies and the target Job Description (JD).\n\n" +
                    "CRITICAL INSTRUCTIONS:\n" +
                    "1. Accurately extract the target role title, company, and functional domain from the pasted Job Description (JD).\n" +
                    "2. Determine the candidate's primary domain from known skills, and the JD's primary domain from the job description.\n" +
                    "3. If the candidate's skills belong to an entirely different domain than what this JD demands (e.g. software engineer applying to sales/nursing/finance, or sales applicant applying to software/cloud), set 'hasDomainMismatch': true. If both are in the same domain or have high functional overlap, set 'hasDomainMismatch': false.\n" +
                    "4. In 'matchScore' (0-100), compute the GENUINE mathematical match rate based on the proportion of required competencies possessed. If candidate skills are unrelated, matchScore MUST BE TRUTHFULLY LOW (e.g. 5-15%). NEVER inflate or give a fake score! If skills genuinely match, calculate the true percentage.\n" +
                    "5. In 'requiredSkills', list the actual competencies, qualifications, technologies, and responsibilities demanded by this specific JD.\n" +
                    "6. In 'matchedSkills', list only skills the candidate actually possesses that satisfy JD requirements.\n" +
                    "7. In 'gapSkills', list the actual missing competencies required by this JD that the candidate does not have.\n" +
                    "8. In 'surplusSkills', list candidate skills that are possessed but not requested or utilized by this JD.\n" +
                    "9. In 'domainDifferenceSummary', clearly and factually explain the exact difference between the candidate's demonstrated skillset and this job's actual requirements.\n" +
                    "10. In 'skillComparisons', provide an item-by-item breakdown for every required skill (as MATCH or GAP) and surplus skill (as SURPLUS).\n" +
                    "11. In 'actionableAdvice', provide specific strategic next steps tailored to closing the identified gaps for this role.\n\n" +
                    "CANDIDATE KNOWN SKILLS:\n" + (knownSkills != null && !knownSkills.isBlank() ? knownSkills : "(No explicit skills provided)") + "\n\n" +
                    "TARGET JOB DESCRIPTION:\n" + jobDescription + "\n\n" +
                    "Optional Role Hint: " + (targetRole != null ? targetRole : "N/A") + "\n" +
                    "Optional Company Hint: " + (targetCompany != null ? targetCompany : "N/A") + "\n\n" +
                    "Return ONLY a valid JSON object strictly matching this schema:\n" +
                    "{\n" +
                    "  \"matchScore\": 10,\n" +
                    "  \"targetRole\": \"Role Title\",\n" +
                    "  \"targetCompany\": \"Company Name\",\n" +
                    "  \"targetDomain\": \"Domain Name\",\n" +
                    "  \"candidateDomain\": \"Domain Name\",\n" +
                    "  \"hasDomainMismatch\": false,\n" +
                    "  \"domainDifferenceSummary\": \"Detailed explanation\",\n" +
                    "  \"requiredSkills\": [\"Skill 1\", \"Skill 2\"],\n" +
                    "  \"matchedSkills\": [\"Skill 1\"],\n" +
                    "  \"gapSkills\": [\"Skill 2\"],\n" +
                    "  \"surplusSkills\": [\"Skill 3\"],\n" +
                    "  \"skillComparisons\": [\n" +
                    "    {\n" +
                    "      \"skillName\": \"Skill Name\",\n" +
                    "      \"category\": \"FUNCTIONAL\",\n" +
                    "      \"requiredByJd\": true,\n" +
                    "      \"possessedByCandidate\": false,\n" +
                    "      \"status\": \"GAP\",\n" +
                    "      \"importance\": \"CRITICAL\",\n" +
                    "      \"explanation\": \"Why it is a gap\"\n" +
                    "    }\n" +
                    "  ],\n" +
                    "  \"actionableAdvice\": [\"Advice 1\", \"Advice 2\"]\n" +
                    "}";

            String cleanJson = callGeminiApi(prompt);
            com.hiresense.modules.intelligence.dto.JdSkillGapAnalysisResponse res =
                    objectMapper.readValue(cleanJson, com.hiresense.modules.intelligence.dto.JdSkillGapAnalysisResponse.class);

            if (res != null && res.getRequiredSkills() != null && !res.getRequiredSkills().isEmpty()) {
                log.info("Gemini live JD skill gap calibration succeeded: {}% fit for {}", res.getMatchScore(), res.getTargetRole());
                return res;
            }
        } catch (Exception e) {
            log.warn("Gemini API call failed for JD skill gap analysis: {}. Falling back to multi-domain calibration engine.", e.getMessage());
        }

        return calibrationEngine.analyzeJd(knownSkills, jobDescription, targetRole, targetCompany);
    }

    @Override
    public String generateCoverLetter(
            String candidateName,
            String candidateEmail,
            String candidatePhone,
            String companyName,
            String roleTitle,
            String jobDescription,
            String resumeText,
            String tone,
            String additionalInstructions,
            String candidateSkills,
            String degree,
            String college
    ) {
        if (isApiKeyUnset()) {
            log.info("Gemini API key is unconfigured. Utilizing deterministic cover letter generator.");
            return CoverLetterDeterministicGenerator.generate(
                    candidateName, candidateEmail, candidatePhone,
                    companyName, roleTitle, jobDescription, resumeText,
                    tone, additionalInstructions, candidateSkills, degree, college
            );
        }

        try {
            log.info("Generating Live Gemini AI Cover Letter for {} at {} (Tone: {})", roleTitle, companyName, tone);
            String prompt = CoverLetterPromptTemplate.SYSTEM_INSTRUCTION + "\n\n" +
                    CoverLetterPromptTemplate.buildPrompt(
                            candidateName, candidateEmail, candidatePhone,
                            companyName, roleTitle, jobDescription, resumeText,
                            tone, additionalInstructions, candidateSkills, degree, college
                    );

            String cleanJson = callGeminiApi(prompt);
            JsonNode root = objectMapper.readTree(cleanJson);
            String letter = root.path("coverLetter").asText(null);
            if (letter != null && !letter.isBlank()) {
                log.info("Gemini cover letter generation successfully generated {} characters", letter.length());
                return letter.trim();
            }
            if (!cleanJson.isBlank() && !cleanJson.startsWith("{")) {
                return cleanJson.trim();
            }
        } catch (Exception e) {
            log.warn("Gemini API call failed for Cover Letter: {}. Falling back to deterministic generator.", e.getMessage());
        }

        return CoverLetterDeterministicGenerator.generate(
                candidateName, candidateEmail, candidatePhone,
                companyName, roleTitle, jobDescription, resumeText,
                tone, additionalInstructions, candidateSkills, degree, college
        );
    }
}
