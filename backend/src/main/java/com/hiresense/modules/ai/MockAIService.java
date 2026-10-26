package com.hiresense.modules.ai;

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
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service("mockAIService")
@RequiredArgsConstructor
public class MockAIService implements AIService {

    private final HeuristicResumeAnalyzer heuristicAnalyzer;
    private final TopicModelAnswerGenerator topicModelAnswerGenerator;
    private final com.hiresense.modules.intelligence.service.JdSkillGapCalibrationEngine calibrationEngine;

    @Override
    public ResumeAnalysisResultDto analyzeResume(String sanitizedResumeText, String targetRole, String targetCompany) {
        return analyzeResume(sanitizedResumeText, targetRole, targetCompany, null);
    }

    @Override
    public ResumeAnalysisResultDto analyzeResume(String sanitizedResumeText, String targetRole, String targetCompany, String jobDescription) {
        log.info("Executing Mock AI Resume Diagnostic (Mode: {})", jobDescription != null ? "JD Matching" : "Standalone");
        return heuristicAnalyzer.analyze(sanitizedResumeText, targetRole, targetCompany, jobDescription);
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
        log.info("Generating Mock AI Interview Question (Type: {}, Topic: {}, Depth: {}, Seq: {}/{})",
                type, topic, difficulty, sequenceNumber, totalQuestions);

        InterviewDifficulty effectiveDifficulty = difficulty;
        if (difficulty == InterviewDifficulty.ADAPTIVE) {
            if (previousTurnScore != null) {
                if (previousTurnScore >= 80) effectiveDifficulty = InterviewDifficulty.HARD;
                else if (previousTurnScore <= 50) effectiveDifficulty = InterviewDifficulty.EASY;
                else effectiveDifficulty = InterviewDifficulty.MEDIUM;
            } else {
                effectiveDifficulty = sequenceNumber <= 1 ? InterviewDifficulty.EASY :
                        (sequenceNumber <= 3 ? InterviewDifficulty.MEDIUM : InterviewDifficulty.HARD);
            }
        }

        String effectiveTopic = (topic != null && !topic.isBlank()) ? topic.trim() :
                (type == InterviewType.HR_BEHAVIORAL ? "HR & Behavioral Leadership" :
                        (type == InterviewType.PROJECT_DEEP_DIVE ? "Project Architecture & Trade-offs" : "Core Computer Science & Programming"));

        if (type == InterviewType.HR_BEHAVIORAL) {
            return generateMockHrQuestion(sequenceNumber, targetCompany, effectiveDifficulty, effectiveTopic);
        } else if (type == InterviewType.PROJECT_DEEP_DIVE) {
            return generateMockProjectQuestion(sequenceNumber, projectSummary, effectiveDifficulty, effectiveTopic);
        } else {
            return generateDynamicTopicQuestion(sequenceNumber, targetRole, candidateSkills, effectiveDifficulty, effectiveTopic);
        }
    }

    @Override
    public TurnEvaluationDto evaluateInterviewAnswer(
            String questionText,
            String topic,
            InterviewDifficulty difficulty,
            String candidateAnswer
    ) {
        log.info("Evaluating Mock AI Interview Answer for topic: {}", topic);

        TopicModelAnswerGenerator.ModelAnswerResult modelResult = topicModelAnswerGenerator.generate(topic, questionText, difficulty);

        // 1. Strict Silence and Non-Answer Detection
        if (isNonAnswer(candidateAnswer)) {
            log.info("Non-answer / silence detected for question '{}'. Awarding 0 score.", questionText);
            return TurnEvaluationDto.builder()
                    .relevanceScore(0)
                    .technicalCorrectnessScore(0)
                    .completenessScore(0)
                    .clarityScore(0)
                    .communicationScore(0)
                    .overallTurnScore(0)
                    .strengths(List.of())
                    .weaknesses(List.of("Candidate remained silent or provided no substantive answer for this question."))
                    .improvementSuggestions(List.of("Review the simple model answer and code example below to prepare for this question."))
                    .suggestedFollowUpTopic(topic != null ? topic : "Foundational Review")
                    .modelAnswer(modelResult.modelAnswer)
                    .practicalExample(modelResult.practicalExample)
                    .keyTakeaways(modelResult.keyTakeaways)
                    .build();
        }

        String clean = candidateAnswer.trim();
        int wordCount = clean.split("\\s+").length;

        // 2. Genuine Rubric Evaluation based on substance
        int relevance;
        int technical;
        int completeness;
        int clarity;
        int communication;

        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        if (wordCount < 10) {
            relevance = 25;
            technical = 20;
            completeness = 15;
            clarity = 30;
            communication = 30;
            weaknesses.add("Answer is extremely brief (< 10 words) and lacks core technical substance.");
            suggestions.add("Elaborate with concrete definitions, implementation patterns, and practical code-level examples.");
        } else if (wordCount < 25) {
            relevance = 60;
            technical = 55;
            completeness = 50;
            clarity = 65;
            communication = 60;
            strengths.add("Identified basic concepts relevant to " + (topic != null ? topic : "the topic") + ".");
            weaknesses.add("Lacks in-depth explanation of internal mechanisms and edge case handling.");
            suggestions.add("Add details about memory management, time complexities, and architectural trade-offs.");
        } else if (wordCount < 50) {
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
                .suggestedFollowUpTopic(topic + " Advanced Mechanics")
                .modelAnswer(modelResult.modelAnswer)
                .practicalExample(modelResult.practicalExample)
                .keyTakeaways(modelResult.keyTakeaways)
                .build();
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

    @Override
    public InterviewFinalReportDto generateFinalInterviewReport(
            InterviewType type,
            String targetRole,
            String targetCompany,
            List<TurnReviewDto> turnReviews
    ) {
        log.info("Generating Final Interview Report from {} turns", turnReviews.size());

        if (turnReviews.isEmpty()) {
            return InterviewFinalReportDto.builder()
                    .overallScore(0)
                    .technicalScore(0)
                    .behavioralScore(0)
                    .communicationScore(0)
                    .summaryEvaluation("No questions were completed during this interview session.")
                    .build();
        }

        int totalScore = 0;
        int totalTech = 0;
        int totalRelevance = 0;
        int totalComm = 0;

        List<String> topicsToImprove = new ArrayList<>();
        List<String> keyStrengths = new ArrayList<>();
        List<String> keyWeaknesses = new ArrayList<>();

        for (TurnReviewDto turn : turnReviews) {
            TurnEvaluationDto eval = turn.getEvaluation();
            if (eval != null) {
                totalScore += eval.getOverallTurnScore();
                totalTech += eval.getTechnicalCorrectnessScore();
                totalRelevance += eval.getRelevanceScore();
                totalComm += eval.getCommunicationScore();

                if (eval.getOverallTurnScore() < 65) {
                    topicsToImprove.add(turn.getTopic());
                }
                if (!eval.getStrengths().isEmpty() && keyStrengths.size() < 3) {
                    keyStrengths.add(eval.getStrengths().get(0));
                }
                if (!eval.getWeaknesses().isEmpty() && keyWeaknesses.size() < 3) {
                    keyWeaknesses.add(eval.getWeaknesses().get(0));
                }
            }
        }

        int count = turnReviews.size();
        int avgOverall = totalScore / count;
        int avgTech = totalTech / count;
        int avgBehavioral = totalRelevance / count;
        int avgComm = totalComm / count;

        if (avgOverall == 0) {
            return InterviewFinalReportDto.builder()
                    .overallScore(0)
                    .technicalScore(0)
                    .behavioralScore(0)
                    .communicationScore(0)
                    .summaryEvaluation("Candidate did not provide verbal or written responses for the interview questions. Consistent practice and active participation are required to evaluate placement readiness.")
                    .keyStrengths(List.of())
                    .keyWeaknesses(List.of("No answers were submitted during this interview session."))
                    .topicsToImprove(List.of("Active Question Attempting", "Verbal Fluency"))
                    .actionableRoadmapSuggestions(List.of(
                            "Re-attempt the interview session and speak into the microphone or type your responses.",
                            "Review core fundamental definitions before starting the timer."
                    ))
                    .build();
        }

        if (keyStrengths.isEmpty()) {
            keyStrengths.add("Demonstrated foundational familiarity with interview concepts.");
        }
        if (keyWeaknesses.isEmpty()) {
            keyWeaknesses.add("Could provide more quantitative metrics when discussing technical trade-offs.");
        }

        List<String> suggestions = List.of(
                "Review foundational design patterns and time/space complexities for upcoming campus rounds.",
                "Practice framing answers using the STAR method (Situation, Task, Action, Result) for behavioral scenarios.",
                "Enrich system-level responses with practical database indexing and concurrency handling strategies."
        );

        String summary = String.format(
                "Candidate completed a %s session for %s at %s. Demonstrates an overall placement readiness index of %d%% across %d evaluation turns.",
                type.name().replace("_", " "),
                targetRole != null ? targetRole : "Software Engineer",
                targetCompany != null ? targetCompany : "Industry Benchmarks",
                avgOverall,
                count
        );

        return InterviewFinalReportDto.builder()
                .overallScore(avgOverall)
                .technicalScore(avgTech)
                .behavioralScore(avgBehavioral)
                .communicationScore(avgComm)
                .summaryEvaluation(summary)
                .keyStrengths(keyStrengths)
                .keyWeaknesses(keyWeaknesses)
                .topicsToImprove(topicsToImprove.isEmpty() ? List.of("General System Architecture") : topicsToImprove)
                .actionableRoadmapSuggestions(suggestions)
                .build();
    }

    // Dynamic Topic Question Generator supporting ANY topic at Easy, Medium, In-Depth depth
    private InterviewQuestionDto generateDynamicTopicQuestion(int seq, String role, String skills, InterviewDifficulty diff, String topic) {
        String questionText;
        String subtopic = topic;

        if (diff == InterviewDifficulty.EASY) {
            switch (seq % 5) {
                case 1 -> {
                    questionText = String.format("What are the fundamental concepts, core definitions, and primary purpose of %s?", topic);
                    subtopic = topic + " Fundamentals";
                }
                case 2 -> {
                    questionText = String.format("Can you explain the key syntax, lifecycle, or basic workflow when implementing %s in a standard application?", topic);
                    subtopic = topic + " Core Workflow";
                }
                case 3 -> {
                    questionText = String.format("What are the main advantages and common use cases of %s compared to older or alternative approaches?", topic);
                    subtopic = topic + " Advantages & Use Cases";
                }
                case 4 -> {
                    questionText = String.format("What are the basic data structures, types, or building blocks that %s relies on?", topic);
                    subtopic = topic + " Building Blocks";
                }
                default -> {
                    questionText = String.format("Can you give a simple real-world code or design example illustrating how %s solves a common programming problem?", topic);
                    subtopic = topic + " Practical Example";
                }
            }
        } else if (diff == InterviewDifficulty.HARD) { // IN_DEPTH
            switch (seq % 5) {
                case 1 -> {
                    questionText = String.format("In deep technical terms, how does %s work internally under the hood? Walk through its memory model, data structures, and execution pipeline.", topic);
                    subtopic = topic + " Internal Architecture";
                }
                case 2 -> {
                    questionText = String.format("How does %s behave under high concurrency, race conditions, and thread contention? What locking or synchronization guarantees exist?", topic);
                    subtopic = topic + " Concurrency & Race Conditions";
                }
                case 3 -> {
                    questionText = String.format("What are the critical performance bottlenecks, memory leaks, or garbage collection overheads associated with %s at high throughput?", topic);
                    subtopic = topic + " Performance & Memory Bottlenecks";
                }
                case 4 -> {
                    questionText = String.format("How would you architect and optimize %s in a distributed system to handle failover, data consistency, and low-latency scaling?", topic);
                    subtopic = topic + " Distributed Scalability & Failover";
                }
                default -> {
                    questionText = String.format("Describe a complex debugging scenario or catastrophic edge-case failure involving %s, and how you would diagnose and resolve it.", topic);
                    subtopic = topic + " Edge Cases & Diagnostics";
                }
            }
        } else { // MEDIUM (Standard Placement Level)
            switch (seq % 5) {
                case 1 -> {
                    questionText = String.format("Explain the core architecture and standard design patterns utilized when working with %s in %s.", topic, (role != null ? role : "software engineering"));
                    subtopic = topic + " Architecture & Patterns";
                }
                case 2 -> {
                    questionText = String.format("What are the time and space complexity trade-offs, indexing strategies, or efficiency considerations when using %s?", topic);
                    subtopic = topic + " Complexity & Efficiency Trade-offs";
                }
                case 3 -> {
                    questionText = String.format("How do you handle error management, input validation, and transaction safety when implementing %s?", topic);
                    subtopic = topic + " Error Handling & Validation";
                }
                case 4 -> {
                    questionText = String.format("Compare %s with its most prominent alternative or competitor. When would you choose one over the other in production?", topic);
                    subtopic = topic + " Comparative Trade-offs";
                }
                default -> {
                    questionText = String.format("Explain how you would write unit and integration tests to verify the reliability and edge cases of a module built with %s.", topic);
                    subtopic = topic + " Testing & Quality Assurance";
                }
            }
        }

        return InterviewQuestionDto.builder()
                .sequenceNumber(seq)
                .category("TECHNICAL")
                .topic(subtopic)
                .difficulty(diff)
                .questionText(questionText)
                .contextRationale(String.format("Probing %s depth and competency for %s topic in %s.", diff, topic, (role != null ? role : "Software Engineering")))
                .build();
    }

    private InterviewQuestionDto generateMockHrQuestion(int seq, String company, InterviewDifficulty diff, String topic) {
        String[] questions = {
                String.format("Could you walk me through your background and what motivated you to specialize in %s?", topic),
                String.format("Can you describe a challenging technical disagreement or roadblock involving %s that you faced in a team, and how you resolved it?", topic),
                String.format("Why are you interested in joining %s, and how do your skills in %s align with our technical vision?", (company != null ? company : "our engineering team"), topic),
                String.format("What do you consider your greatest strength in %s, and what is an area where you seek mentorship or growth?", topic),
                String.format("How do you keep your knowledge current with emerging best practices and architectural shifts in %s?", topic)
        };
        String[] topics = {"Background & Motivation", "Conflict Resolution", "Company Alignment", "Self Awareness & Growth", "Continuous Learning"};

        int idx = Math.min(seq - 1, questions.length - 1);
        return InterviewQuestionDto.builder()
                .sequenceNumber(seq)
                .category("HR")
                .topic(topics[idx])
                .difficulty(diff)
                .questionText(questions[idx])
                .contextRationale("Evaluating candidate communication, behavioral alignment, and cultural fit.")
                .build();
    }

    private InterviewQuestionDto generateMockProjectQuestion(int seq, String projectSummary, InterviewDifficulty diff, String topic) {
        String[] questions = {
                String.format("Could you provide an architectural walkthrough of how you applied %s in your primary project? What were the core constraints and technical decisions?", topic),
                String.format("Why did you choose %s for your project over alternative frameworks, and what trade-offs did you make?", topic),
                String.format("What was the most challenging bug or performance bottleneck involving %s in your project, and how did you debug it?", topic),
                String.format("How did you secure and validate your %s endpoints and data pipelines against unauthorized access or corruption?", topic),
                String.format("If your %s application had to scale to support 100,000 daily active users, what caching, partitioning, or concurrency changes would you make?", topic)
        };
        String[] topics = {"Project Architecture", "Technology Selection & Trade-offs", "Debugging & Root Cause", "API Security & Validation", "System Scalability"};

        int idx = Math.min(seq - 1, questions.length - 1);
        return InterviewQuestionDto.builder()
                .sequenceNumber(seq)
                .category("PROJECT")
                .topic(topics[idx])
                .difficulty(diff)
                .questionText(questions[idx])
                .contextRationale("Evaluating candidate project ownership, technical decision-making, and architectural reasoning.")
                .build();
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
        log.info("Generating Mock AI Career Assistant response for query: {}", userMessage);
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
            
            // Extract Topics
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

            // Extract topic mentioned via "on <topic>" or "about <topic>"
            if (detectedTopics.isEmpty()) {
                java.util.regex.Matcher tm = java.util.regex.Pattern.compile("(?:on|about|for|topic)\\s+([a-zA-Z0-9+#]+)").matcher(query);
                if (tm.find()) {
                    String extracted = tm.group(1).trim();
                    if (!extracted.equalsIgnoreCase("the") && !extracted.equalsIgnoreCase("me") && !extracted.equalsIgnoreCase("an") && !extracted.equalsIgnoreCase("a")) {
                        detectedTopics.add(Character.toUpperCase(extracted.charAt(0)) + extracted.substring(1).toLowerCase());
                    }
                }
            }

            // Extract question count if requested
            int requestedCount = 15;
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("(\\d+)\\s*(?:questions?|mcqs?|q)").matcher(query);
            if (m.find()) {
                try {
                    requestedCount = Integer.parseInt(m.group(1));
                    if (requestedCount < 5) requestedCount = 5;
                    if (requestedCount > 30) requestedCount = 30;
                } catch (Exception ignored) {}
            }

            // Extract difficulty
            String diff = "MEDIUM";
            if (query.contains("easy")) diff = "EASY";
            else if (query.contains("hard")) diff = "HARD";
            else if (query.contains("mixed")) diff = "MIXED";

            // If no topic specified, personalize based on real student data
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
                    "You can ask me anything about your readiness metrics, interview tips, DSA concepts, resume enhancements, or study plans. How can I help you today?",
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
                    "- **Assessment Confidence:** %d%% (indicates diagnostic coverage)\n\n" +
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
        } else if (query.contains("why") && (query.contains("low") || query.contains("score") || query.contains("prs"))) {
            reply = String.format(
                    "Your Placement Readiness Score is currently **%d/100** with **%d%% assessment confidence**.\n\n" +
                    "📈 **Why this score was calculated:**\n" +
                    "1. **Opportunity Area:** %s currently has your lowest diagnostic verification score.\n" +
                    "2. **Evidence Coverage:** Your confidence index of %d%% indicates that %s.\n" +
                    "3. **Company Benchmark:** %s requires high proficiency in core problem solving and system architecture.\n\n" +
                    "As you complete structured practice questions, upload resume revisions, and finish mock interviews, your score will calibrate upwards dynamically!",
                    prsScore, confidence, opportunity, confidence,
                    confidence < 50 ? "further assessments are needed to establish comprehensive evidence" : "solid initial evidence has been submitted",
                    company
            );
            evidence.add("PRS Explainable Breakdown");
            evidence.add("Assessment Confidence Calibration");
            suggestions.add("Upload your latest technical resume for ATS parsability evaluation.");
            suggestions.add("Launch an interactive Mock Technical Interview session.");
        } else if (query.contains("today") || query.contains("study") || query.contains("roadmap") || query.contains("schedule")) {
            reply = String.format(
                    "📅 **Your Daily Placement Study Plan:**\n\n" +
                    "You are preparing for **%s** targeting **%s**.\n\n" +
                    "Current Roadmap Progress: **%s completed**.\n\n" +
                    "🎯 **Focus for Today:**\n" +
                    "- Dedicate 45 minutes to your highest priority gap: **%s**.\n" +
                    "- Practice 2 standard coding problems on data structures and algorithm fundamentals.\n" +
                    "- Review system design principles and API architecture relevant to %s.",
                    role, company, roadmapProgress != null ? roadmapProgress : "Active track",
                    topGaps != null && !topGaps.isEmpty() ? topGaps.get(0) : opportunity,
                    company
            );
            evidence.add("Personalized Adaptive Roadmap");
            suggestions.add("Mark completed roadmap tasks in the Prep Roadmap tab.");
            suggestions.add("Practice timed coding questions in Diagnostic MCQs.");
        } else if (query.contains("dsa") || query.contains("algorithm") || query.contains("data structure") || query.contains("leetcode") || query.contains("coding")) {
            reply = String.format(
                    "💡 **DSA & Coding Mastery Plan for %s:**\n\n" +
                    "For **%s** interviews, technical rounds predominantly test:\n" +
                    "1. **Core Data Structures:** Arrays, HashMaps, Two-Pointer / Sliding Window, Trees (Binary Search Trees, Traversal), and Graphs (BFS/DFS).\n" +
                    "2. **Algorithmic Patterns:** Dynamic Programming (memoization & tabulation), Greedy approaches, and Binary Search variants.\n" +
                    "3. **Complexity Analysis:** Always state Time and Space complexities upfront (e.g. $O(N)$ time, $O(1)$ auxiliary space).\n\n" +
                    "Your verified strength is **%s** — leverage that foundation to tackle complex graph and tree problems!",
                    company, role, strength
            );
            evidence.add("Core CS Knowledge Base");
            suggestions.add("Review Two-Pointer and Sliding Window patterns.");
            suggestions.add("Simulate a live coding interview in the Mock Interview module.");
        } else if (query.contains("resume") || query.contains("ats") || query.contains("project")) {
            reply = String.format(
                    "📄 **Resume & Portfolio Optimization for %s:**\n\n" +
                    "To pass recruiter screens and ATS filters for **%s**:\n" +
                    "- **Action Verbs & Quantifiable Impact:** Use Google's XYZ formula: *Accomplished [X], measured by [Y], by doing [Z]*.\n" +
                    "- **Target Keywords:** Ensure skills matching %s and %s are prominently featured in your Technical Skills section.\n" +
                    "- **Project Depth:** Detail architectural trade-offs, database indexing, and authentication mechanisms.",
                    role, company, role, opportunity
            );
            evidence.add("AI Resume Diagnostic Engine");
            suggestions.add("Run your resume through the AI Resume Analyzer.");
            suggestions.add("Refactor project bullet points using quantifiable metrics.");
        } else {
            reply = String.format(
                    "Regarding **\"%s\"** for your **%s** preparation at **%s**:\n\n" +
                    "Your current verified baseline is **%d/100 PRS (%s)** with verified strength in **%s**.\n\n" +
                    "To excel in campus placement drives:\n" +
                    "- Systematically bridge active gaps in **%s**.\n" +
                    "- Maintain consistent daily roadmap execution (%s completed).\n" +
                    "- Participate in turn-by-turn AI mock interviews to build fluency under realistic timed conditions.",
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
                .aiProvider("MOCK_DETERMINISTIC")
                .timestamp(java.time.Instant.now())
                .build();
    }

    @Override
    public List<com.hiresense.modules.assessment.model.Question> generateAssessmentQuestions(
            String topic,
            com.hiresense.modules.assessment.model.AssessmentDifficulty difficulty,
            int count
    ) {
        log.info("Generating {} AI-Assisted Assessment MCQs for topic: {} (Difficulty: {})", count, topic, difficulty);
        String cleanTopic = (topic != null && !topic.isBlank()) ? topic.trim() : "Software Engineering";
        com.hiresense.modules.assessment.model.AssessmentDifficulty diff = 
                (difficulty != null && difficulty != com.hiresense.modules.assessment.model.AssessmentDifficulty.MIXED) 
                        ? difficulty : com.hiresense.modules.assessment.model.AssessmentDifficulty.MEDIUM;

        List<com.hiresense.modules.assessment.model.Question> questions = new ArrayList<>();
        int target = Math.max(1, Math.min(count, 30));

        String[][] templates = new String[][] {
            {
                "In %s, which design principle or mechanism is primarily leveraged to maximize modularity and separation of concerns?",
                "Coupling tightly across monolithic components",
                "Encapsulation and dependency inversion",
                "Global mutable static variables",
                "Direct low-level memory re-allocation",
                "B",
                "Encapsulation and dependency inversion separate business contracts from implementation specifics, allowing modular maintenance and testing in %s.",
                "%sModule service = new %sServiceImpl(repository);",
                "Building resilient microservices and decoupled enterprise systems using %s."
            },
            {
                "What is the time/computational complexity consideration when performing high-frequency data operations in %s?",
                "All operations execute in constant O(1) time unconditionally",
                "Choosing appropriate data structures optimizes average-case access time from O(N) to O(1) or O(log N)",
                "Data structures have zero impact on system memory consumption in %s",
                "Linear traversal is always superior to hashed lookups",
                "B",
                "Selecting the right collection or index reduces traversal overhead from O(N) to O(log N) or amortized O(1), ensuring throughput under production load.",
                "Map<String, Record> cache = new HashMap<>(); // O(1) average lookup",
                "Optimizing search latencies and memory efficiency in %s workloads."
            },
            {
                "How does %s handle concurrent execution and resource synchronization in multi-threaded or distributed environments?",
                "By disabling all asynchronous tasks automatically",
                "By ignoring race conditions during simultaneous read-write operations",
                "By using thread-safe primitives, mutexes, or immutable data structures to prevent race conditions",
                "By forcing single-process execution across all operating system cores",
                "C",
                "Thread synchronization, atomic variables, and immutable state prevent race conditions and memory consistency errors in %s.",
                "AtomicInteger counter = new AtomicInteger(0); counter.incrementAndGet();",
                "Preventing data corruption and race conditions in concurrent web services using %s."
            },
            {
                "What is the recommended best practice for error handling and exception management in %s production environments?",
                "Suppress all exceptions silently with empty catch blocks",
                "Use structured exceptions, meaningful logging, and graceful degradation to maintain system stability",
                "Crash the entire application whenever any unchecked condition occurs",
                "Rely solely on standard output console printing for error telemetry",
                "B",
                "Robust error handling captures contextual metadata, enables retries or fallback mechanisms, and prevents cascade failures across %s applications.",
                "try { process(); } catch (SpecificException e) { log.error(\"Context: \", e); throw new ServiceException(e); }",
                "High-availability web APIs and fault-tolerant background workers in %s."
            },
            {
                "In modern %s architecture, what is the primary advantage of utilizing asynchronous or non-blocking I/O?",
                "Eliminates the requirement for any system CPU processing",
                "Enables high scalability by handling thousands of concurrent requests without dedicating a thread per connection",
                "Guarantees that database queries finish in zero milliseconds",
                "Replaces unit testing and functional validation completely",
                "B",
                "Non-blocking I/O maximizes server utilization by releasing executing worker threads while waiting for I/O responses, scaling network throughput in %s.",
                "CompletableFuture.supplyAsync(() -> fetchRemoteData()).thenAccept(this::process);",
                "Event-driven messaging and real-time streaming architectures using %s."
            }
        };

        for (int i = 0; i < target; i++) {
            String[] t = templates[i % templates.length];
            String qText = String.format(t[0], cleanTopic);
            if (i >= templates.length) {
                qText = String.format("[%s Drill #%d] ", cleanTopic, i + 1) + qText;
            }

            com.hiresense.modules.assessment.model.Question q = com.hiresense.modules.assessment.model.Question.builder()
                    .category(com.hiresense.modules.assessment.model.AssessmentCategory.CORE_CS_TECHNICAL)
                    .topic(cleanTopic)
                    .difficulty(diff)
                    .questionText(qText)
                    .explanation(String.format(t[6], cleanTopic))
                    .example(String.format(t[7], cleanTopic, cleanTopic))
                    .useCase(String.format(t[8], cleanTopic))
                    .marks(1)
                    .active(true)
                    .options(new ArrayList<>())
                    .build();

            String correctOpt = t[5];
            com.hiresense.modules.assessment.model.QuestionOption optA = com.hiresense.modules.assessment.model.QuestionOption.builder()
                    .question(q).optionLabel("A").optionText(String.format(t[1], cleanTopic)).correct("A".equals(correctOpt)).build();
            com.hiresense.modules.assessment.model.QuestionOption optB = com.hiresense.modules.assessment.model.QuestionOption.builder()
                    .question(q).optionLabel("B").optionText(String.format(t[2], cleanTopic)).correct("B".equals(correctOpt)).build();
            com.hiresense.modules.assessment.model.QuestionOption optC = com.hiresense.modules.assessment.model.QuestionOption.builder()
                    .question(q).optionLabel("C").optionText(String.format(t[3], cleanTopic)).correct("C".equals(correctOpt)).build();
            com.hiresense.modules.assessment.model.QuestionOption optD = com.hiresense.modules.assessment.model.QuestionOption.builder()
                    .question(q).optionLabel("D").optionText(String.format(t[4], cleanTopic)).correct("D".equals(correctOpt)).build();

            q.getOptions().addAll(List.of(optA, optB, optC, optD));
            questions.add(q);
        }

        return questions;
    }

    @Override
    public com.hiresense.modules.intelligence.dto.JdSkillGapAnalysisResponse analyzeJdSkillGaps(
            String knownSkills,
            String jobDescription,
            String targetRole,
            String targetCompany
    ) {
        log.info("Executing Mock AI / Deterministic Multi-Domain Skill Gap Calibration");
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
        log.info("Executing Mock AI Cover Letter Generation for {} at {}", roleTitle, companyName);
        return CoverLetterDeterministicGenerator.generate(
                candidateName, candidateEmail, candidatePhone,
                companyName, roleTitle, jobDescription, resumeText,
                tone, additionalInstructions, candidateSkills, degree, college
        );
    }

    @Override
    public String getProviderName() {
        return "MOCK";
    }

    @Override
    public String getModelName() {
        return "mock-deterministic-v2";
    }
}
