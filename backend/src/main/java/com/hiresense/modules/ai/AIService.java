package com.hiresense.modules.ai;

import com.hiresense.modules.interview.dto.InterviewFinalReportDto;
import com.hiresense.modules.interview.dto.InterviewQuestionDto;
import com.hiresense.modules.interview.dto.TurnEvaluationDto;
import com.hiresense.modules.interview.dto.TurnReviewDto;
import com.hiresense.modules.interview.model.InterviewDifficulty;
import com.hiresense.modules.interview.model.InterviewType;
import com.hiresense.modules.resume.dto.ResumeAnalysisResultDto;

import java.util.List;

public interface AIService {
    ResumeAnalysisResultDto analyzeResume(String sanitizedResumeText, String targetRole, String targetCompany);
    
    default ResumeAnalysisResultDto analyzeResume(String sanitizedResumeText, String targetRole, String targetCompany, String jobDescription) {
        return analyzeResume(sanitizedResumeText, targetRole, targetCompany);
    }

    InterviewQuestionDto generateInterviewQuestion(
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
    );

    TurnEvaluationDto evaluateInterviewAnswer(
            String questionText,
            String topic,
            InterviewDifficulty difficulty,
            String candidateAnswer
    );

    InterviewFinalReportDto generateFinalInterviewReport(
            InterviewType type,
            String targetRole,
            String targetCompany,
            List<TurnReviewDto> turnReviews
    );

    com.hiresense.modules.assistant.dto.CareerAssistantDtos.ChatResponse chatCareerAssistant(
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
    );

    List<com.hiresense.modules.assessment.model.Question> generateAssessmentQuestions(
            String topic,
            com.hiresense.modules.assessment.model.AssessmentDifficulty difficulty,
            int count
    );

    com.hiresense.modules.intelligence.dto.JdSkillGapAnalysisResponse analyzeJdSkillGaps(
            String knownSkills,
            String jobDescription,
            String targetRole,
            String targetCompany
    );

    String generateCoverLetter(
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
    );

    String getProviderName();
    String getModelName();
}
