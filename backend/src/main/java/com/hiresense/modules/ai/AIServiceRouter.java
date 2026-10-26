package com.hiresense.modules.ai;

import com.hiresense.modules.interview.dto.InterviewFinalReportDto;
import com.hiresense.modules.interview.dto.InterviewQuestionDto;
import com.hiresense.modules.interview.dto.TurnEvaluationDto;
import com.hiresense.modules.interview.dto.TurnReviewDto;
import com.hiresense.modules.interview.model.InterviewDifficulty;
import com.hiresense.modules.interview.model.InterviewType;
import com.hiresense.modules.resume.dto.ResumeAnalysisResultDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@Primary
public class AIServiceRouter implements AIService {

    private final AIService mockAIService;
    private final AIService geminiAIService;

    @Value("${hiresense.ai.provider:mock}")
    private String configuredProvider;

    public AIServiceRouter(
            @Qualifier("mockAIService") AIService mockAIService,
            @Qualifier("geminiAIService") AIService geminiAIService) {
        this.mockAIService = mockAIService;
        this.geminiAIService = geminiAIService;
    }

    @Override
    public ResumeAnalysisResultDto analyzeResume(String sanitizedResumeText, String targetRole, String targetCompany) {
        return analyzeResume(sanitizedResumeText, targetRole, targetCompany, null);
    }

    @Override
    public ResumeAnalysisResultDto analyzeResume(String sanitizedResumeText, String targetRole, String targetCompany, String jobDescription) {
        AIService activeService = getActiveService();
        log.info("Routing resume analysis to active AI Provider: {} (Mode: {})", activeService.getProviderName(), jobDescription != null ? "JD Matching" : "Standalone");
        return activeService.analyzeResume(sanitizedResumeText, targetRole, targetCompany, jobDescription);
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
        AIService activeService = getActiveService();
        return activeService.generateInterviewQuestion(
                type, difficulty, targetRole, targetCompany, topic, sequenceNumber, totalQuestions,
                candidateSkills, projectSummary, previousQuestion, previousAnswer, previousTurnScore
        );
    }

    @Override
    public TurnEvaluationDto evaluateInterviewAnswer(
            String questionText,
            String topic,
            InterviewDifficulty difficulty,
            String candidateAnswer
    ) {
        AIService activeService = getActiveService();
        return activeService.evaluateInterviewAnswer(questionText, topic, difficulty, candidateAnswer);
    }

    @Override
    public InterviewFinalReportDto generateFinalInterviewReport(
            InterviewType type,
            String targetRole,
            String targetCompany,
            List<TurnReviewDto> turnReviews
    ) {
        AIService activeService = getActiveService();
        return activeService.generateFinalInterviewReport(type, targetRole, targetCompany, turnReviews);
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
        AIService activeService = getActiveService();
        try {
            return activeService.chatCareerAssistant(
                    userMessage, targetRole, targetCompany, prsScore, confidence,
                    readinessBand, strongestArea, biggestOpportunity, topGaps, roadmapProgress, recentHistory
            );
        } catch (Exception e) {
            log.error("AI service error in chatCareerAssistant (provider: {}): {}. Falling back to mock assistant.",
                    activeService.getProviderName(), e.getMessage());
            return mockAIService.chatCareerAssistant(
                    userMessage, targetRole, targetCompany, prsScore, confidence,
                    readinessBand, strongestArea, biggestOpportunity, topGaps, roadmapProgress, recentHistory
            );
        }
    }

    @Override
    public String getProviderName() {
        return getActiveService().getProviderName();
    }

    @Override
    public List<com.hiresense.modules.assessment.model.Question> generateAssessmentQuestions(
            String topic,
            com.hiresense.modules.assessment.model.AssessmentDifficulty difficulty,
            int count
    ) {
        AIService activeService = getActiveService();
        try {
            return activeService.generateAssessmentQuestions(topic, difficulty, count);
        } catch (Exception e) {
            log.warn("AI question generation failed via {}, utilizing fallback generator: {}", activeService.getProviderName(), e.getMessage());
            return mockAIService.generateAssessmentQuestions(topic, difficulty, count);
        }
    }

    @Override
    public com.hiresense.modules.intelligence.dto.JdSkillGapAnalysisResponse analyzeJdSkillGaps(
            String knownSkills,
            String jobDescription,
            String targetRole,
            String targetCompany
    ) {
        AIService activeService = getActiveService();
        log.info("Routing JD skill gap calibration to active AI Provider: {}", activeService.getProviderName());
        try {
            return activeService.analyzeJdSkillGaps(knownSkills, jobDescription, targetRole, targetCompany);
        } catch (Exception e) {
            log.warn("Active AI Provider failed for JD skill gap analysis: {}. Falling back to mock/deterministic engine.", e.getMessage());
            return mockAIService.analyzeJdSkillGaps(knownSkills, jobDescription, targetRole, targetCompany);
        }
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
        AIService activeService = getActiveService();
        log.info("Routing Cover Letter Generation to active AI Provider: {}", activeService.getProviderName());
        try {
            return activeService.generateCoverLetter(
                    candidateName, candidateEmail, candidatePhone,
                    companyName, roleTitle, jobDescription, resumeText,
                    tone, additionalInstructions, candidateSkills, degree, college
            );
        } catch (Exception e) {
            log.warn("Active AI Provider failed for Cover Letter Generation: {}. Falling back to mock engine.", e.getMessage());
            return mockAIService.generateCoverLetter(
                    candidateName, candidateEmail, candidatePhone,
                    companyName, roleTitle, jobDescription, resumeText,
                    tone, additionalInstructions, candidateSkills, degree, college
            );
        }
    }

    @Override
    public String getModelName() {
        return getActiveService().getModelName();
    }

    private AIService getActiveService() {
        if ("gemini".equalsIgnoreCase(configuredProvider)) {
            return geminiAIService;
        }
        return mockAIService;
    }
}
