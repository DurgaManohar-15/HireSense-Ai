package com.hiresense.modules.interview.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiresense.common.exception.BadRequestException;
import com.hiresense.common.exception.ResourceNotFoundException;
import com.hiresense.modules.ai.AIService;
import com.hiresense.modules.ai.InterviewPromptTemplate;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.interview.dto.*;
import com.hiresense.modules.interview.model.*;
import com.hiresense.modules.interview.repository.*;
import com.hiresense.modules.profile.model.StudentProfile;
import com.hiresense.modules.profile.repository.StudentProfileRepository;
import com.hiresense.modules.resume.model.Resume;
import com.hiresense.modules.resume.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final InterviewQuestionRepository questionRepository;
    private final InterviewAnswerRepository answerRepository;
    private final InterviewTurnEvaluationRepository evaluationRepository;
    private final InterviewFinalReportRepository finalReportRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository profileRepository;
    private final ResumeRepository resumeRepository;
    private final AIService aiService;
    private final TopicModelAnswerGenerator topicModelAnswerGenerator;
    private final ObjectMapper objectMapper;

    @Transactional
    public InterviewSessionDto startInterview(Long userId, StartInterviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        // Mark any currently in-progress interview as ABANDONED
        interviewRepository.findFirstByUserIdAndStatus(userId, InterviewStatus.IN_PROGRESS)
                .ifPresent(existing -> {
                    existing.setStatus(InterviewStatus.ABANDONED);
                    existing.setCompletedAt(Instant.now());
                    interviewRepository.save(existing);
                });

        // Gather student context
        Optional<StudentProfile> profileOpt = profileRepository.findByUserId(userId);
        Optional<Resume> activeResumeOpt = resumeRepository.findFirstByUserIdAndActiveTrueOrderByVersionNumberDesc(userId);

        String targetRole = (request.getTargetRole() != null && !request.getTargetRole().isBlank()) ?
                request.getTargetRole() : profileOpt.map(StudentProfile::getTargetRole).orElse("Software Engineer");

        String targetCompany = (request.getTargetCompany() != null && !request.getTargetCompany().isBlank()) ?
                request.getTargetCompany() : profileOpt.map(p -> p.getTargetCompany() != null ? p.getTargetCompany().getName() : "Tech Industry").orElse("Tech Industry");

        String topic = (request.getTopic() != null && !request.getTopic().isBlank()) ?
                request.getTopic().trim() : (request.getInterviewType() == InterviewType.HR_BEHAVIORAL ? "HR & Behavioral Leadership" :
                (request.getInterviewType() == InterviewType.PROJECT_DEEP_DIVE ? "Project Architecture & Trade-offs" : "Core CS Fundamentals & Programming"));

        String candidateSkills = activeResumeOpt.map(r -> "Verified Resume Skills: " + r.getOriginalFilename())
                .orElse("Core CS Fundamentals, Java, OOP, SQL, Data Structures");

        int totalQuestions = request.getTotalQuestions() != null && request.getTotalQuestions() > 0 ?
                Math.min(10, Math.max(1, request.getTotalQuestions())) : 5;

        // 1. Create Interview Session
        Interview interview = Interview.builder()
                .user(user)
                .interviewType(request.getInterviewType())
                .difficulty(request.getDifficulty() != null ? request.getDifficulty() : InterviewDifficulty.ADAPTIVE)
                .targetRole(targetRole)
                .targetCompany(targetCompany)
                .topic(topic)
                .totalQuestions(totalQuestions)
                .currentQuestionIndex(1)
                .status(InterviewStatus.IN_PROGRESS)
                .aiProvider(aiService.getProviderName())
                .aiModel(aiService.getModelName())
                .promptVersion(InterviewPromptTemplate.PROMPT_VERSION)
                .startedAt(Instant.now())
                .build();

        Interview savedInterview = interviewRepository.save(interview);

        // 2. Generate First Question (Seq 1)
        InterviewQuestionDto qDto = aiService.generateInterviewQuestion(
                request.getInterviewType(),
                interview.getDifficulty(),
                targetRole,
                targetCompany,
                topic,
                1,
                totalQuestions,
                candidateSkills,
                "Academic Capstone Project",
                null,
                null,
                null
        );

        InterviewQuestion question1 = InterviewQuestion.builder()
                .interview(savedInterview)
                .sequenceNumber(1)
                .category(qDto.getCategory() != null ? qDto.getCategory() : "TECHNICAL")
                .topic(qDto.getTopic() != null ? qDto.getTopic() : topic)
                .difficulty(qDto.getDifficulty() != null ? qDto.getDifficulty() : InterviewDifficulty.MEDIUM)
                .questionText(qDto.getQuestionText())
                .contextRationale(qDto.getContextRationale())
                .build();

        questionRepository.save(question1);

        return mapToSessionDto(savedInterview, question1);
    }

    @Transactional(readOnly = true)
    public InterviewSessionDto getInterviewSession(Long interviewId, Long userId) {
        Interview interview = interviewRepository.findByIdAndUserId(interviewId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found or unauthorized"));

        InterviewQuestion currentQ = null;
        if (interview.getStatus() == InterviewStatus.IN_PROGRESS) {
            currentQ = questionRepository.findByInterviewIdAndSequenceNumber(interviewId, interview.getCurrentQuestionIndex())
                    .orElse(null);
        }

        return mapToSessionDto(interview, currentQ);
    }

    @Transactional
    public SubmitAnswerResponse submitAnswer(Long interviewId, Long userId, SubmitAnswerRequest request) {
        Interview interview = interviewRepository.findByIdAndUserId(interviewId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found or unauthorized"));

        if (interview.getStatus() != InterviewStatus.IN_PROGRESS) {
            throw new BadRequestException("This interview session is already " + interview.getStatus() + ". No more answers can be submitted.");
        }

        InterviewQuestion question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + request.getQuestionId()));

        if (!question.getInterview().getId().equals(interviewId)) {
            throw new BadRequestException("Question does not belong to this interview session.");
        }

        // Prevent duplicate answer submission
        if (answerRepository.findByInterviewIdAndQuestionId(interviewId, question.getId()).isPresent()) {
            throw new BadRequestException("An answer has already been submitted for this question.");
        }

        // 1. Record Answer
        int words = request.getAnswerText() != null ? request.getAnswerText().trim().split("\\s+").length : 0;
        InterviewAnswer answer = InterviewAnswer.builder()
                .interview(interview)
                .question(question)
                .answerText(request.getAnswerText())
                .wordCount(words)
                .timeTakenSeconds(request.getTimeTakenSeconds() != null ? request.getTimeTakenSeconds() : 30)
                .build();
        InterviewAnswer savedAnswer = answerRepository.save(answer);

        // 2. Evaluate Answer Turn
        TurnEvaluationDto evalDto = aiService.evaluateInterviewAnswer(
                question.getQuestionText(),
                question.getTopic(),
                question.getDifficulty(),
                request.getAnswerText()
        );

        String evalJson;
        try {
            evalJson = objectMapper.writeValueAsString(evalDto);
        } catch (Exception e) {
            evalJson = "{}";
        }

        InterviewTurnEvaluation turnEval = InterviewTurnEvaluation.builder()
                .interview(interview)
                .question(question)
                .answer(savedAnswer)
                .relevanceScore(evalDto.getRelevanceScore())
                .technicalCorrectnessScore(evalDto.getTechnicalCorrectnessScore())
                .completenessScore(evalDto.getCompletenessScore())
                .clarityScore(evalDto.getClarityScore())
                .communicationScore(evalDto.getCommunicationScore())
                .overallTurnScore(evalDto.getOverallTurnScore())
                .evaluationJson(evalJson)
                .build();
        evaluationRepository.save(turnEval);

        // 3. Check if all questions are completed
        boolean isFinished = question.getSequenceNumber() >= interview.getTotalQuestions();

        if (isFinished) {
            interview.setStatus(InterviewStatus.COMPLETED);
            interview.setCompletedAt(Instant.now());
            interviewRepository.save(interview);

            // Generate Final Report
            List<TurnReviewDto> turnReviews = loadTurnReviews(interviewId);
            InterviewFinalReportDto reportDto = aiService.generateFinalInterviewReport(
                    interview.getInterviewType(),
                    interview.getTargetRole(),
                    interview.getTargetCompany(),
                    turnReviews
            );

            String reportJson;
            try {
                reportJson = objectMapper.writeValueAsString(reportDto);
            } catch (Exception e) {
                reportJson = "{}";
            }

            InterviewFinalReport finalReport = InterviewFinalReport.builder()
                    .interview(interview)
                    .user(interview.getUser())
                    .overallScore(reportDto.getOverallScore())
                    .technicalScore(reportDto.getTechnicalScore())
                    .behavioralScore(reportDto.getBehavioralScore())
                    .communicationScore(reportDto.getCommunicationScore())
                    .passed(reportDto.getOverallScore() >= 70)
                    .structuredReportJson(reportJson)
                    .completedAt(Instant.now())
                    .build();
            finalReportRepository.save(finalReport);

            return SubmitAnswerResponse.builder()
                    .turnEvaluation(evalDto)
                    .finished(true)
                    .currentQuestionIndex(interview.getTotalQuestions())
                    .totalQuestions(interview.getTotalQuestions())
                    .build();
        } else {
            // 4. Generate Next Question (Adaptive progression)
            int nextSeq = question.getSequenceNumber() + 1;
            interview.setCurrentQuestionIndex(nextSeq);
            interviewRepository.save(interview);

            InterviewQuestionDto nextQDto = aiService.generateInterviewQuestion(
                    interview.getInterviewType(),
                    interview.getDifficulty(),
                    interview.getTargetRole(),
                    interview.getTargetCompany(),
                    interview.getTopic(),
                    nextSeq,
                    interview.getTotalQuestions(),
                    "Java, Spring Boot, MySQL",
                    "Capstone Architecture",
                    question.getQuestionText(),
                    request.getAnswerText(),
                    evalDto.getOverallTurnScore()
            );

            InterviewQuestion nextQuestion = InterviewQuestion.builder()
                    .interview(interview)
                    .sequenceNumber(nextSeq)
                    .category(nextQDto.getCategory() != null ? nextQDto.getCategory() : "TECHNICAL")
                    .topic(nextQDto.getTopic() != null ? nextQDto.getTopic() : interview.getTopic())
                    .difficulty(nextQDto.getDifficulty() != null ? nextQDto.getDifficulty() : InterviewDifficulty.MEDIUM)
                    .questionText(nextQDto.getQuestionText())
                    .contextRationale(nextQDto.getContextRationale())
                    .build();

            InterviewQuestion savedNextQ = questionRepository.save(nextQuestion);

            return SubmitAnswerResponse.builder()
                    .turnEvaluation(evalDto)
                    .finished(false)
                    .nextQuestion(mapToQuestionDto(savedNextQ))
                    .currentQuestionIndex(nextSeq)
                    .totalQuestions(interview.getTotalQuestions())
                    .build();
        }
    }

    @Transactional(readOnly = true)
    public InterviewFinalReportResponse getFinalReport(Long interviewId, Long userId) {
        Interview interview = interviewRepository.findByIdAndUserId(interviewId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found or unauthorized"));

        InterviewFinalReport report = finalReportRepository.findByInterviewId(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Final report not found for interview session: " + interviewId));

        InterviewFinalReportDto reportDto;
        try {
            reportDto = objectMapper.readValue(report.getStructuredReportJson(), InterviewFinalReportDto.class);
        } catch (Exception e) {
            reportDto = InterviewFinalReportDto.builder()
                    .overallScore(report.getOverallScore())
                    .technicalScore(report.getTechnicalScore())
                    .behavioralScore(report.getBehavioralScore())
                    .communicationScore(report.getCommunicationScore())
                    .build();
        }

        List<TurnReviewDto> turnReviews = loadTurnReviews(interviewId);

        return InterviewFinalReportResponse.builder()
                .id(report.getId())
                .interviewId(interview.getId())
                .interviewType(interview.getInterviewType())
                .difficulty(interview.getDifficulty())
                .targetRole(interview.getTargetRole())
                .targetCompany(interview.getTargetCompany())
                .topic(interview.getTopic())
                .overallScore(report.getOverallScore())
                .technicalScore(report.getTechnicalScore())
                .behavioralScore(report.getBehavioralScore())
                .communicationScore(report.getCommunicationScore())
                .passed(report.isPassed())
                .aiProvider(interview.getAiProvider())
                .aiModel(interview.getAiModel())
                .report(reportDto)
                .turnReviews(turnReviews)
                .completedAt(report.getCompletedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<InterviewHistorySummaryDto> getMyInterviewHistory(Long userId) {
        return interviewRepository.findByUserIdOrderByStartedAtDesc(userId).stream()
                .map(i -> {
                    Optional<InterviewFinalReport> rOpt = finalReportRepository.findByInterviewId(i.getId());
                    return InterviewHistorySummaryDto.builder()
                            .id(i.getId())
                            .interviewType(i.getInterviewType())
                            .difficulty(i.getDifficulty())
                            .targetRole(i.getTargetRole())
                            .targetCompany(i.getTargetCompany())
                            .topic(i.getTopic())
                            .totalQuestions(i.getTotalQuestions())
                            .overallScore(rOpt.map(InterviewFinalReport::getOverallScore).orElse(null))
                            .passed(rOpt.map(InterviewFinalReport::isPassed).orElse(false))
                            .status(i.getStatus())
                            .aiProvider(i.getAiProvider())
                            .startedAt(i.getStartedAt())
                            .completedAt(i.getCompletedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    // Helper to map and assemble turn-by-turn reviews
    private List<TurnReviewDto> loadTurnReviews(Long interviewId) {
        List<InterviewQuestion> questions = questionRepository.findByInterviewIdOrderBySequenceNumberAsc(interviewId);
        List<TurnReviewDto> reviews = new ArrayList<>();

        for (InterviewQuestion q : questions) {
            Optional<InterviewAnswer> ansOpt = answerRepository.findByInterviewIdAndQuestionId(interviewId, q.getId());
            TurnEvaluationDto evalDto = null;
            String ansText = ansOpt.map(InterviewAnswer::getAnswerText).orElse("No answer recorded");
            int wordCount = ansOpt.map(InterviewAnswer::getWordCount).orElse(0);
            int timeTaken = ansOpt.map(InterviewAnswer::getTimeTakenSeconds).orElse(0);

            if (ansOpt.isPresent()) {
                Optional<InterviewTurnEvaluation> evalOpt = evaluationRepository.findByAnswerId(ansOpt.get().getId());
                if (evalOpt.isPresent()) {
                    try {
                        evalDto = objectMapper.readValue(evalOpt.get().getEvaluationJson(), TurnEvaluationDto.class);
                    } catch (Exception e) {
                        evalDto = TurnEvaluationDto.builder()
                                .overallTurnScore(evalOpt.get().getOverallTurnScore())
                                .relevanceScore(evalOpt.get().getRelevanceScore())
                                .technicalCorrectnessScore(evalOpt.get().getTechnicalCorrectnessScore())
                                .build();
                    }
                }
            }

            String modelAns = evalDto != null ? evalDto.getModelAnswer() : null;
            String pracEx = evalDto != null ? evalDto.getPracticalExample() : null;
            if (modelAns == null || modelAns.isBlank()) {
                TopicModelAnswerGenerator.ModelAnswerResult res = topicModelAnswerGenerator.generate(q.getTopic(), q.getQuestionText(), q.getDifficulty());
                modelAns = res.modelAnswer;
                if (pracEx == null || pracEx.isBlank()) {
                    pracEx = res.practicalExample;
                }
                if (evalDto != null) {
                    if (evalDto.getModelAnswer() == null || evalDto.getModelAnswer().isBlank()) {
                        evalDto.setModelAnswer(res.modelAnswer);
                    }
                    if (evalDto.getPracticalExample() == null || evalDto.getPracticalExample().isBlank()) {
                        evalDto.setPracticalExample(res.practicalExample);
                    }
                    if (evalDto.getKeyTakeaways() == null || evalDto.getKeyTakeaways().isEmpty()) {
                        evalDto.setKeyTakeaways(res.keyTakeaways);
                    }
                }
            }

            reviews.add(TurnReviewDto.builder()
                    .sequenceNumber(q.getSequenceNumber())
                    .questionText(q.getQuestionText())
                    .topic(q.getTopic())
                    .difficulty(q.getDifficulty())
                    .answerText(ansText)
                    .wordCount(wordCount)
                    .timeTakenSeconds(timeTaken)
                    .modelAnswer(modelAns)
                    .practicalExample(pracEx)
                    .evaluation(evalDto)
                    .build());
        }

        return reviews;
    }

    private InterviewSessionDto mapToSessionDto(Interview interview, InterviewQuestion currentQuestion) {
        List<InterviewAnswer> answers = answerRepository.findByInterviewId(interview.getId());
        return InterviewSessionDto.builder()
                .id(interview.getId())
                .interviewType(interview.getInterviewType())
                .difficulty(interview.getDifficulty())
                .targetRole(interview.getTargetRole())
                .targetCompany(interview.getTargetCompany())
                .topic(interview.getTopic())
                .totalQuestions(interview.getTotalQuestions())
                .currentQuestionIndex(interview.getCurrentQuestionIndex())
                .status(interview.getStatus())
                .aiProvider(interview.getAiProvider())
                .aiModel(interview.getAiModel())
                .startedAt(interview.getStartedAt())
                .completedAt(interview.getCompletedAt())
                .currentQuestion(currentQuestion != null ? mapToQuestionDto(currentQuestion) : null)
                .answeredQuestionsCount(answers.size())
                .finished(interview.getStatus() == InterviewStatus.COMPLETED)
                .build();
    }

    private InterviewQuestionDto mapToQuestionDto(InterviewQuestion q) {
        return InterviewQuestionDto.builder()
                .id(q.getId())
                .sequenceNumber(q.getSequenceNumber())
                .category(q.getCategory())
                .topic(q.getTopic())
                .difficulty(q.getDifficulty())
                .questionText(q.getQuestionText())
                .contextRationale(q.getContextRationale())
                .build();
    }
}
