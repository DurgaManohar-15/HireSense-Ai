package com.hiresense.modules.assessment.service;

import com.hiresense.common.exception.BadRequestException;
import com.hiresense.common.exception.ResourceNotFoundException;
import com.hiresense.modules.assessment.dto.*;
import com.hiresense.modules.assessment.model.*;
import com.hiresense.modules.assessment.repository.*;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.intelligence.service.PlacementReadinessCalculatorService;
import com.hiresense.modules.intelligence.service.SkillGapAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AssessmentService {

    private final AssessmentDefinitionRepository definitionRepository;
    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository optionRepository;
    private final AssessmentSessionRepository sessionRepository;
    private final SessionQuestionRepository sessionQuestionRepository;
    private final StudentResponseRepository responseRepository;
    private final AssessmentResultRepository resultRepository;
    private final TopicPerformanceAnalyticsRepository topicAnalyticsRepository;
    private final DifficultyPerformanceAnalyticsRepository difficultyAnalyticsRepository;
    private final UserRepository userRepository;
    private final PlacementReadinessCalculatorService readinessService;
    private final SkillGapAnalysisService skillGapService;
    private final com.hiresense.modules.ai.AIService aiService;

    // Grace period for network latency on timer submission
    private static final long GRACE_PERIOD_SECONDS = 15;

    @Transactional(readOnly = true)
    public List<AssessmentDefinitionDto> getAllAvailableAssessments() {
        return definitionRepository.findByActiveTrue().stream()
                .map(this::mapToDefinitionDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AssessmentDefinitionDto getAssessmentDefinitionById(Long id) {
        AssessmentDefinition def = definitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment definition not found with id: " + id));
        return mapToDefinitionDto(def);
    }

    @Transactional(readOnly = true)
    public List<AssessmentTopicDto> getAvailableTopicsWithCounts() {
        Map<String, AssessmentTopicDto> topicMap = new LinkedHashMap<>();
        try {
            List<Object[]> rawCounts = questionRepository.findTopicDifficultyCounts();
            for (Object[] row : rawCounts) {
                if (row == null || row.length < 4 || row[0] == null) continue;
                String topic = String.valueOf(row[0]);

                AssessmentCategory parsedCat = AssessmentCategory.CORE_CS_TECHNICAL;
                if (row[1] instanceof AssessmentCategory) {
                    parsedCat = (AssessmentCategory) row[1];
                } else if (row[1] != null) {
                    try {
                        parsedCat = AssessmentCategory.valueOf(row[1].toString());
                    } catch (Exception ignored) {}
                }
                final AssessmentCategory category = parsedCat;

                String diffName = "MEDIUM";
                if (row[2] instanceof AssessmentDifficulty) {
                    diffName = ((AssessmentDifficulty) row[2]).name();
                } else if (row[2] != null) {
                    diffName = row[2].toString();
                }

                long count = 0;
                if (row[3] instanceof Number) {
                    count = ((Number) row[3]).longValue();
                }

                AssessmentTopicDto dto = topicMap.computeIfAbsent(topic, k -> AssessmentTopicDto.builder()
                        .topic(topic)
                        .category(category)
                        .totalAvailableQuestions(0)
                        .difficultyCounts(new HashMap<>())
                        .build());

                dto.setTotalAvailableQuestions(dto.getTotalAvailableQuestions() + (int) count);
                dto.getDifficultyCounts().put(diffName, (int) count);
            }
        } catch (Exception e) {
            log.warn("Failed to query topic difficulty counts, falling back to findByActiveTrue: {}", e.getMessage());
        }

        // If topicMap is empty, populate from all active questions
        if (topicMap.isEmpty()) {
            List<Question> allQuestions = questionRepository.findByActiveTrue();
            for (Question q : allQuestions) {
                String topic = q.getTopic();
                AssessmentTopicDto dto = topicMap.computeIfAbsent(topic, k -> AssessmentTopicDto.builder()
                        .topic(topic)
                        .category(q.getCategory())
                        .totalAvailableQuestions(0)
                        .difficultyCounts(new HashMap<>())
                        .build());
                dto.setTotalAvailableQuestions(dto.getTotalAvailableQuestions() + 1);
                String diffName = q.getDifficulty() != null ? q.getDifficulty().name() : "MEDIUM";
                dto.getDifficultyCounts().put(diffName, dto.getDifficultyCounts().getOrDefault(diffName, 0) + 1);
            }
        }

        return new ArrayList<>(topicMap.values());
    }

    @Transactional(readOnly = true)
    public AssessmentAvailabilityDto checkQuestionAvailability(CustomAssessmentConfigRequest request) {
        List<String> cleanTopics = normalizeTopics(request.getTopics());
        AssessmentDifficulty difficulty = request.getDifficulty();
        boolean isMixed = difficulty == null || difficulty == AssessmentDifficulty.MIXED;

        List<Question> matchingQuestions;
        if (cleanTopics.isEmpty()) {
            matchingQuestions = isMixed 
                    ? questionRepository.findByActiveTrue() 
                    : questionRepository.findByTopicsAndDifficulty(
                            questionRepository.findAllDistinctActiveTopics().stream().map(String::toLowerCase).toList(), difficulty);
        } else {
            matchingQuestions = isMixed
                    ? questionRepository.findByTopics(cleanTopics)
                    : questionRepository.findByTopicsAndDifficulty(cleanTopics, difficulty);
        }

        int availableCount = matchingQuestions.size();
        int requestedCount = request.getQuestionCount() != null ? request.getQuestionCount() : 15;
        boolean sufficient = availableCount >= requestedCount;

        Map<String, Integer> topicBreakdown = new HashMap<>();
        Map<String, Integer> diffBreakdown = new HashMap<>();

        for (Question q : matchingQuestions) {
            topicBreakdown.put(q.getTopic(), topicBreakdown.getOrDefault(q.getTopic(), 0) + 1);
            diffBreakdown.put(q.getDifficulty().name(), diffBreakdown.getOrDefault(q.getDifficulty().name(), 0) + 1);
        }

        String message;
        if (availableCount == 0) {
            message = "No questions are currently available for this topic and difficulty.";
        } else if (!sufficient) {
            message = "Only " + availableCount + " suitable questions are currently available for this selection.";
        } else {
            message = "Successfully found " + availableCount + " questions matching your selection.";
        }

        return AssessmentAvailabilityDto.builder()
                .requestedTopics(request.getTopics())
                .requestedDifficulty(difficulty)
                .requestedCount(requestedCount)
                .availableCount(availableCount)
                .sufficient(sufficient)
                .message(message)
                .topicBreakdown(topicBreakdown)
                .difficultyBreakdown(diffBreakdown)
                .build();
    }

    @Transactional
    public AssessmentSessionDto startAssessmentSession(Long userId, StartAssessmentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        AssessmentDefinition definition = null;
        if (request.getAssessmentDefinitionId() != null) {
            definition = definitionRepository.findById(request.getAssessmentDefinitionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assessment definition not found with id: " + request.getAssessmentDefinitionId()));
        }

        // Check if there is an active unfinished session
        Optional<AssessmentSession> existingSessionOpt = sessionRepository.findFirstByUserIdAndStatus(userId, AssessmentSessionStatus.IN_PROGRESS);
        if (existingSessionOpt.isPresent()) {
            AssessmentSession existing = existingSessionOpt.get();
            if (Instant.now().isBefore(existing.getExpiresAt().plusSeconds(GRACE_PERIOD_SECONDS))) {
                return mapToSessionDto(existing);
            } else {
                evaluateAndFinalizeSession(existing);
            }
        }

        AssessmentCategory category = definition != null ? definition.getCategory() :
                (request.getCategory() != null ? request.getCategory() : AssessmentCategory.CORE_CS_TECHNICAL);

        String title = definition != null ? definition.getTitle() : "Standard Assessment (" + category + ")";
        int durationMinutes = definition != null ? definition.getDurationMinutes() : 20;
        int questionCount = definition != null ? definition.getTotalQuestions() :
                (request.getQuestionCount() != null ? request.getQuestionCount() : 10);

        List<Question> candidateQuestions;
        if (category == AssessmentCategory.COMPREHENSIVE_MOCK) {
            candidateQuestions = questionRepository.findByActiveTrue();
        } else {
            candidateQuestions = questionRepository.findByCategoryAndActiveTrue(category);
        }

        if (candidateQuestions.isEmpty()) {
            throw new BadRequestException("No active questions available in the question bank for category: " + category);
        }

        List<Question> selectedQuestions = new ArrayList<>(candidateQuestions);
        Collections.shuffle(selectedQuestions);
        if (selectedQuestions.size() > questionCount) {
            selectedQuestions = selectedQuestions.subList(0, questionCount);
        }

        Instant now = Instant.now();
        Instant expiresAt = now.plus(Duration.ofMinutes(durationMinutes));

        AssessmentSession session = AssessmentSession.builder()
                .user(user)
                .assessmentDefinition(definition)
                .assessmentTitle(title)
                .category(category)
                .status(AssessmentSessionStatus.IN_PROGRESS)
                .totalQuestions(selectedQuestions.size())
                .durationMinutes(durationMinutes)
                .startedAt(now)
                .expiresAt(expiresAt)
                .build();

        AssessmentSession savedSession = sessionRepository.save(session);
        persistSessionQuestions(savedSession, selectedQuestions);

        return mapToSessionDto(savedSession);
    }

    @Transactional
    public AssessmentSessionDto startCustomAssessmentSession(Long userId, CustomAssessmentConfigRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check if there is an active unfinished session
        Optional<AssessmentSession> existingSessionOpt = sessionRepository.findFirstByUserIdAndStatus(userId, AssessmentSessionStatus.IN_PROGRESS);
        if (existingSessionOpt.isPresent()) {
            AssessmentSession existing = existingSessionOpt.get();
            if (Instant.now().isBefore(existing.getExpiresAt().plusSeconds(GRACE_PERIOD_SECONDS))) {
                return mapToSessionDto(existing);
            } else {
                evaluateAndFinalizeSession(existing);
            }
        }

        List<String> cleanTopics = normalizeTopics(request.getTopics());
        AssessmentDifficulty difficulty = request.getDifficulty() != null ? request.getDifficulty() : AssessmentDifficulty.MEDIUM;
        boolean isMixed = difficulty == AssessmentDifficulty.MIXED;

        List<Question> candidateQuestions;
        if (cleanTopics.isEmpty()) {
            candidateQuestions = isMixed
                    ? new ArrayList<>(questionRepository.findByActiveTrue())
                    : new ArrayList<>(questionRepository.findByTopicsAndDifficulty(
                            questionRepository.findAllDistinctActiveTopics().stream().map(String::toLowerCase).toList(), difficulty));
        } else {
            candidateQuestions = isMixed
                    ? new ArrayList<>(questionRepository.findByTopics(cleanTopics))
                    : new ArrayList<>(questionRepository.findByTopicsAndDifficulty(cleanTopics, difficulty));
        }

        int requestedCount = request.getQuestionCount() != null ? request.getQuestionCount() : 15;

        // Dynamic AI Generation: If not enough questions exist for this topic, generate with AI Agent
        if (candidateQuestions.size() < requestedCount) {
            int needed = requestedCount - candidateQuestions.size();
            List<String> topicsToGenerate = cleanTopics.isEmpty() ? List.of("General Software Engineering") : request.getTopics();
            for (String t : topicsToGenerate) {
                if (needed <= 0) break;
                int toGen = Math.min(needed, 10);
                try {
                    List<Question> aiQuestions = aiService.generateAssessmentQuestions(t, difficulty, toGen);
                    if (aiQuestions != null) {
                        for (Question q : aiQuestions) {
                            Question savedQ = questionRepository.save(q);
                            if (q.getOptions() != null) {
                                for (QuestionOption opt : q.getOptions()) {
                                    opt.setQuestion(savedQ);
                                }
                                optionRepository.saveAll(q.getOptions());
                            }
                            candidateQuestions.add(savedQ);
                            needed--;
                        }
                    }
                } catch (Exception e) {
                    log.warn("AI dynamic question generation failed for topic {}: {}", t, e.getMessage());
                }
            }
        }

        if (candidateQuestions.isEmpty()) {
            throw new BadRequestException("Unable to initialize questions for topic: " + request.getTopics());
        }

        List<Question> selectedQuestions = new ArrayList<>(candidateQuestions);
        Collections.shuffle(selectedQuestions);
        int finalCount = Math.min(requestedCount, selectedQuestions.size());
        selectedQuestions = new ArrayList<>(selectedQuestions.subList(0, finalCount));

        int durationMinutes = request.getDurationMinutes() != null && request.getDurationMinutes() > 0
                ? request.getDurationMinutes()
                : Math.max(5, finalCount * 2);

        String topicLabel = cleanTopics.isEmpty() ? "General CS & Aptitude" : String.join(", ", request.getTopics());
        String difficultyLabel = isMixed ? "Mixed Difficulty" : capitalizeWord(difficulty.name().toLowerCase());
        String title = "Custom Assessment: " + topicLabel + " (" + difficultyLabel + ", " + finalCount + " Questions)";

        AssessmentCategory category = request.getCategory() != null ? request.getCategory() :
                (candidateQuestions.get(0) != null ? candidateQuestions.get(0).getCategory() : AssessmentCategory.CORE_CS_TECHNICAL);

        Instant now = Instant.now();
        Instant expiresAt = now.plus(Duration.ofMinutes(durationMinutes));

        AssessmentSession session = AssessmentSession.builder()
                .user(user)
                .assessmentDefinition(null)
                .assessmentTitle(title)
                .category(category)
                .status(AssessmentSessionStatus.IN_PROGRESS)
                .totalQuestions(selectedQuestions.size())
                .durationMinutes(durationMinutes)
                .startedAt(now)
                .expiresAt(expiresAt)
                .build();

        AssessmentSession savedSession = sessionRepository.save(session);
        persistSessionQuestions(savedSession, selectedQuestions);

        return mapToSessionDto(savedSession);
    }

    private void persistSessionQuestions(AssessmentSession session, List<Question> selectedQuestions) {
        List<SessionQuestion> sessionQuestions = new ArrayList<>();
        for (int i = 0; i < selectedQuestions.size(); i++) {
            SessionQuestion sq = SessionQuestion.builder()
                    .session(session)
                    .question(selectedQuestions.get(i))
                    .questionOrder(i + 1)
                    .build();
            sessionQuestions.add(sq);
        }
        sessionQuestionRepository.saveAll(sessionQuestions);
        session.setSessionQuestions(sessionQuestions);
    }

    @Transactional
    public AssessmentSessionDto getActiveSession(Long sessionId, Long userId) {
        AssessmentSession session = sessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment session not found or unauthorized"));

        // Check if session has expired
        if (session.getStatus() == AssessmentSessionStatus.IN_PROGRESS &&
                Instant.now().isAfter(session.getExpiresAt().plusSeconds(GRACE_PERIOD_SECONDS))) {
            evaluateAndFinalizeSession(session);
        }

        return mapToSessionDto(session);
    }

    @Transactional
    public void saveAnswer(Long sessionId, Long userId, SaveAnswerRequest request) {
        AssessmentSession session = sessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment session not found or unauthorized"));

        if (session.getStatus() != AssessmentSessionStatus.IN_PROGRESS) {
            throw new BadRequestException("Cannot save answer. Assessment session is " + session.getStatus());
        }

        if (Instant.now().isAfter(session.getExpiresAt().plusSeconds(GRACE_PERIOD_SECONDS))) {
            evaluateAndFinalizeSession(session);
            throw new BadRequestException("Assessment session has expired. Your responses have been auto-submitted.");
        }

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + request.getQuestionId()));

        QuestionOption option = null;
        if (request.getSelectedOptionId() != null) {
            option = optionRepository.findById(request.getSelectedOptionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Option not found with id: " + request.getSelectedOptionId()));

            if (!option.getQuestion().getId().equals(question.getId())) {
                throw new BadRequestException("Selected option does not belong to the given question");
            }
        }

        StudentResponse studentResponse = responseRepository.findBySessionIdAndQuestionId(sessionId, question.getId())
                .orElse(StudentResponse.builder()
                        .session(session)
                        .question(question)
                        .build());

        studentResponse.setSelectedOption(option);
        studentResponse.setMarkedForReview(request.isMarkedForReview());
        responseRepository.save(studentResponse);
    }

    @Transactional
    public AssessmentResultResponse submitAssessment(Long sessionId, Long userId) {
        AssessmentSession session = sessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment session not found or unauthorized"));

        if (session.getStatus() == AssessmentSessionStatus.COMPLETED) {
            AssessmentResult existingResult = resultRepository.findBySessionId(sessionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Result not found for completed session"));
            return mapToResultResponse(existingResult);
        }

        AssessmentResult result = evaluateAndFinalizeSession(session);
        return mapToResultResponse(result);
    }

    @Transactional
    public AssessmentResult evaluateAndFinalizeSession(AssessmentSession session) {
        if (session.getStatus() == AssessmentSessionStatus.COMPLETED) {
            return resultRepository.findBySessionId(session.getId()).orElse(null);
        }

        Instant now = Instant.now();
        session.setStatus(AssessmentSessionStatus.COMPLETED);
        session.setCompletedAt(now);
        sessionRepository.save(session);

        List<SessionQuestion> sessionQuestions = sessionQuestionRepository.findBySessionIdOrderByQuestionOrderAsc(session.getId());
        List<StudentResponse> responses = responseRepository.findBySessionId(session.getId());
        Map<Long, StudentResponse> responseMap = responses.stream()
                .collect(Collectors.toMap(r -> r.getQuestion().getId(), r -> r));

        int correctCount = 0;
        int incorrectCount = 0;
        int unansweredCount = 0;
        int totalMarksObtained = 0;
        int maxMarks = 0;

        Map<String, TopicAccumulator> topicMap = new HashMap<>();
        Map<AssessmentDifficulty, DifficultyAccumulator> diffMap = new HashMap<>();

        for (SessionQuestion sq : sessionQuestions) {
            Question q = sq.getQuestion();
            maxMarks += q.getMarks();

            StudentResponse resp = responseMap.get(q.getId());
            boolean isCorrect = false;

            if (resp == null || resp.getSelectedOption() == null) {
                unansweredCount++;
                if (resp != null) {
                    resp.setCorrect(false);
                    responseRepository.save(resp);
                }
            } else {
                if (resp.getSelectedOption().isCorrect()) {
                    correctCount++;
                    totalMarksObtained += q.getMarks();
                    isCorrect = true;
                    resp.setCorrect(true);
                } else {
                    incorrectCount++;
                    resp.setCorrect(false);
                }
                responseRepository.save(resp);
            }

            topicMap.computeIfAbsent(q.getTopic(), k -> new TopicAccumulator(q.getTopic(), q.getCategory().name()))
                    .add(isCorrect);

            diffMap.computeIfAbsent(q.getDifficulty(), k -> new DifficultyAccumulator(q.getDifficulty()))
                    .add(isCorrect);
        }

        BigDecimal scorePercentage = maxMarks > 0
                ? BigDecimal.valueOf((double) totalMarksObtained / maxMarks * 100.0).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal passingThreshold = session.getAssessmentDefinition() != null
                ? session.getAssessmentDefinition().getPassingPercentage()
                : new BigDecimal("60.00");

        boolean isPassed = scorePercentage.compareTo(passingThreshold) >= 0;
        long timeTakenSeconds = Math.max(1, Duration.between(session.getStartedAt(), now).getSeconds());

        AssessmentResult result = AssessmentResult.builder()
                .session(session)
                .user(session.getUser())
                .assessmentDefinition(session.getAssessmentDefinition())
                .assessmentTitle(session.getAssessmentTitle())
                .category(session.getCategory())
                .totalQuestions(sessionQuestions.size())
                .correctCount(correctCount)
                .incorrectCount(incorrectCount)
                .unansweredCount(unansweredCount)
                .totalMarksObtained(BigDecimal.valueOf(totalMarksObtained))
                .maxMarks(BigDecimal.valueOf(maxMarks))
                .scorePercentage(scorePercentage)
                .passed(isPassed)
                .timeTakenSeconds((int) timeTakenSeconds)
                .completedAt(now)
                .build();

        AssessmentResult savedResult = resultRepository.save(result);

        // Save Topic Analytics
        List<TopicPerformanceAnalytics> topicAnalyticsList = new ArrayList<>();
        for (TopicAccumulator acc : topicMap.values()) {
            BigDecimal tScore = acc.total > 0
                    ? BigDecimal.valueOf((double) acc.correct / acc.total * 100.0).setScale(2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            TopicPerformanceAnalytics tpa = TopicPerformanceAnalytics.builder()
                    .result(savedResult)
                    .user(session.getUser())
                    .topic(acc.topic)
                    .category(acc.category)
                    .totalQuestions(acc.total)
                    .correctCount(acc.correct)
                    .scorePercentage(tScore)
                    .build();
            topicAnalyticsList.add(tpa);
        }
        topicAnalyticsRepository.saveAll(topicAnalyticsList);
        savedResult.setTopicAnalytics(topicAnalyticsList);

        // Save Difficulty Analytics
        List<DifficultyPerformanceAnalytics> diffAnalyticsList = new ArrayList<>();
        for (DifficultyAccumulator acc : diffMap.values()) {
            BigDecimal dScore = acc.total > 0
                    ? BigDecimal.valueOf((double) acc.correct / acc.total * 100.0).setScale(2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            DifficultyPerformanceAnalytics dpa = DifficultyPerformanceAnalytics.builder()
                    .result(savedResult)
                    .user(session.getUser())
                    .difficulty(acc.difficulty)
                    .totalQuestions(acc.total)
                    .correctCount(acc.correct)
                    .scorePercentage(dScore)
                    .build();
            diffAnalyticsList.add(dpa);
        }
        difficultyAnalyticsRepository.saveAll(diffAnalyticsList);
        savedResult.setDifficultyAnalytics(diffAnalyticsList);

        // Re-calculate Placement Readiness Score and Skill Gap evidence immediately
        try {
            Long userId = session.getUser().getId();
            skillGapService.evaluateAndPersistSkillGaps(userId);
            readinessService.calculateAndPersistReadiness(userId);
            log.info("Placement readiness & skill gaps refreshed following completed assessment session {}", session.getId());
        } catch (Exception e) {
            log.warn("Failed to automatically refresh placement readiness after assessment: {}", e.getMessage());
        }

        return savedResult;
    }

    @Transactional(readOnly = true)
    public AssessmentResultResponse getResultById(Long resultId, Long userId) {
        AssessmentResult result = resultRepository.findByIdAndUserId(resultId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment result not found or unauthorized"));

        return mapToResultResponse(result);
    }

    @Transactional(readOnly = true)
    public List<AssessmentHistorySummaryDto> getStudentAssessmentHistory(Long userId) {
        return resultRepository.findByUserIdOrderByCompletedAtDesc(userId).stream()
                .map(r -> AssessmentHistorySummaryDto.builder()
                        .id(r.getId())
                        .sessionId(r.getSession() != null ? r.getSession().getId() : null)
                        .assessmentTitle(r.getAssessmentTitle())
                        .category(r.getCategory())
                        .totalQuestions(r.getTotalQuestions())
                        .correctCount(r.getCorrectCount())
                        .scorePercentage(r.getScorePercentage())
                        .passed(r.isPassed())
                        .timeTakenSeconds(r.getTimeTakenSeconds())
                        .completedAt(r.getCompletedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TopicPerformanceDto> getAggregateStudentTopicPerformance(Long userId) {
        List<Object[]> rawList = topicAnalyticsRepository.findAggregateTopicPerformanceByUserId(userId);
        List<TopicPerformanceDto> list = new ArrayList<>();

        for (Object[] row : rawList) {
            if (row == null || row.length < 4 || row[0] == null) continue;
            String topic = String.valueOf(row[0]);
            double avgPercentage = row[1] instanceof Number ? ((Number) row[1]).doubleValue() : 0.0;
            int totalQuestions = row[2] instanceof Number ? ((Number) row[2]).intValue() : 0;
            int correctCount = row[3] instanceof Number ? ((Number) row[3]).intValue() : 0;

            list.add(TopicPerformanceDto.builder()
                    .topic(topic)
                    .totalQuestions(totalQuestions)
                    .correctCount(correctCount)
                    .scorePercentage(BigDecimal.valueOf(avgPercentage).setScale(2, RoundingMode.HALF_UP))
                    .build());
        }
        return list;
    }

    // Mapping Helpers
    private AssessmentDefinitionDto mapToDefinitionDto(AssessmentDefinition def) {
        return AssessmentDefinitionDto.builder()
                .id(def.getId())
                .title(def.getTitle())
                .slug(def.getSlug())
                .description(def.getDescription())
                .category(def.getCategory())
                .difficulty(def.getDifficulty())
                .durationMinutes(def.getDurationMinutes())
                .totalQuestions(def.getTotalQuestions())
                .passingPercentage(def.getPassingPercentage())
                .active(def.isActive())
                .build();
    }

    private AssessmentSessionDto mapToSessionDto(AssessmentSession session) {
        long remaining = Math.max(0, Duration.between(Instant.now(), session.getExpiresAt()).getSeconds());

        List<StudentResponse> responses = responseRepository.findBySessionId(session.getId());
        Map<Long, StudentResponse> responseMap = responses.stream()
                .collect(Collectors.toMap(r -> r.getQuestion().getId(), r -> r));

        List<SessionQuestion> sessionQuestions = sessionQuestionRepository.findBySessionIdOrderByQuestionOrderAsc(session.getId());
        List<QuestionDto> questionDtos = sessionQuestions.stream().map(sq -> {
            Question q = sq.getQuestion();
            StudentResponse resp = responseMap.get(q.getId());

            List<QuestionOptionDto> options = q.getOptions().stream()
                    .map(opt -> QuestionOptionDto.builder()
                            .id(opt.getId())
                            .optionLabel(opt.getOptionLabel())
                            .optionText(opt.getOptionText())
                            .correct(null) // Safe: Conceal correct answer during active testing
                            .build())
                    .collect(Collectors.toList());

            return QuestionDto.builder()
                    .id(q.getId())
                    .questionOrder(sq.getQuestionOrder())
                    .category(q.getCategory())
                    .topic(q.getTopic())
                    .difficulty(q.getDifficulty())
                    .questionText(q.getQuestionText())
                    .marks(q.getMarks())
                    .options(options)
                    .selectedOptionId(resp != null && resp.getSelectedOption() != null ? resp.getSelectedOption().getId() : null)
                    .markedForReview(resp != null && resp.isMarkedForReview())
                    .build();
        }).collect(Collectors.toList());

        return AssessmentSessionDto.builder()
                .id(session.getId())
                .assessmentId(session.getAssessmentDefinition() != null ? session.getAssessmentDefinition().getId() : null)
                .assessmentTitle(session.getAssessmentTitle())
                .category(session.getCategory())
                .status(session.getStatus())
                .totalQuestions(session.getTotalQuestions())
                .durationMinutes(session.getDurationMinutes())
                .remainingSeconds(remaining)
                .startedAt(session.getStartedAt())
                .expiresAt(session.getExpiresAt())
                .questions(questionDtos)
                .build();
    }

    private AssessmentResultResponse mapToResultResponse(AssessmentResult result) {
        List<TopicPerformanceDto> topicDtos = result.getTopicAnalytics().stream()
                .map(t -> TopicPerformanceDto.builder()
                        .topic(t.getTopic())
                        .category(t.getCategory())
                        .totalQuestions(t.getTotalQuestions())
                        .correctCount(t.getCorrectCount())
                        .scorePercentage(t.getScorePercentage())
                        .build())
                .collect(Collectors.toList());

        List<DifficultyPerformanceDto> diffDtos = result.getDifficultyAnalytics().stream()
                .map(d -> DifficultyPerformanceDto.builder()
                        .difficulty(d.getDifficulty())
                        .totalQuestions(d.getTotalQuestions())
                        .correctCount(d.getCorrectCount())
                        .scorePercentage(d.getScorePercentage())
                        .build())
                .collect(Collectors.toList());

        List<SessionQuestion> sessionQuestions = sessionQuestionRepository.findBySessionIdOrderByQuestionOrderAsc(result.getSession().getId());
        List<StudentResponse> responses = responseRepository.findBySessionId(result.getSession().getId());
        Map<Long, StudentResponse> responseMap = responses.stream()
                .collect(Collectors.toMap(r -> r.getQuestion().getId(), r -> r));

        List<QuestionReviewDto> reviewDtos = sessionQuestions.stream().map(sq -> {
            Question q = sq.getQuestion();
            StudentResponse resp = responseMap.get(q.getId());

            QuestionOption correctOption = q.getOptions().stream()
                    .filter(QuestionOption::isCorrect)
                    .findFirst()
                    .orElse(null);

            Long correctOptionId = correctOption != null ? correctOption.getId() : null;

            List<QuestionOptionDto> options = q.getOptions().stream()
                    .map(opt -> QuestionOptionDto.builder()
                            .id(opt.getId())
                            .optionLabel(opt.getOptionLabel())
                            .optionText(opt.getOptionText())
                            .correct(opt.isCorrect()) // Disclose correct answer on result review
                            .build())
                    .collect(Collectors.toList());

            Long selectedOptionId = resp != null && resp.getSelectedOption() != null ? resp.getSelectedOption().getId() : null;
            boolean isAnswered = selectedOptionId != null;
            boolean isCorrect = isAnswered && selectedOptionId.equals(correctOptionId);

            String whyIncorrect = null;
            if (!isAnswered) {
                whyIncorrect = "Unanswered: Review this concept to ensure full syllabus coverage.";
            } else if (!isCorrect && resp.getSelectedOption() != null && correctOption != null) {
                whyIncorrect = "You selected (" + resp.getSelectedOption().getOptionLabel() + ") \"" + resp.getSelectedOption().getOptionText() + "\". " +
                        "The correct choice is (" + correctOption.getOptionLabel() + ") because: " + (q.getExplanation() != null ? q.getExplanation() : "of the conceptual definition.");
            }

            return QuestionReviewDto.builder()
                    .id(q.getId())
                    .questionOrder(sq.getQuestionOrder())
                    .category(q.getCategory())
                    .topic(q.getTopic())
                    .difficulty(q.getDifficulty())
                    .questionText(q.getQuestionText())
                    .explanation(q.getExplanation())
                    .example(q.getExample())
                    .useCase(q.getUseCase())
                    .whyIncorrectExplanation(whyIncorrect)
                    .recommendedRevisionTopic(q.getTopic())
                    .marks(q.getMarks())
                    .options(options)
                    .selectedOptionId(selectedOptionId)
                    .correctOptionId(correctOptionId)
                    .correct(isCorrect)
                    .answered(isAnswered)
                    .build();
        }).collect(Collectors.toList());

        // Derive Strengths, Weaknesses, and Actionable Study Recommendations
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        List<String> studyRecommendations = new ArrayList<>();

        for (TopicPerformanceDto td : topicDtos) {
            double score = td.getScorePercentage() != null ? td.getScorePercentage().doubleValue() : 0.0;
            if (score >= 70.0) {
                strengths.add("✓ " + td.getTopic() + " — " + Math.round(score) + "% accuracy (" + td.getCorrectCount() + "/" + td.getTotalQuestions() + " correct). Strong demonstrated foundation.");
            } else {
                weaknesses.add("⚠ " + td.getTopic() + " — " + Math.round(score) + "% accuracy (" + td.getCorrectCount() + "/" + td.getTotalQuestions() + " correct). Requires focused revision.");
                studyRecommendations.add("Revise core " + td.getTopic() + " principles and review the question explanations provided below.");
                studyRecommendations.add("Practice 10-15 targeted " + td.getTopic() + " practice questions to reinforce understanding.");
            }
        }

        if (weaknesses.isEmpty()) {
            studyRecommendations.add("Solid mastery across all tested topics! Proceed to Hard-level problem sets or full-length placement mock tests.");
        } else {
            studyRecommendations.add("Take another custom assessment on your identified weak areas (" + 
                    topicDtos.stream().filter(t -> t.getScorePercentage().doubleValue() < 70.0).map(TopicPerformanceDto::getTopic).collect(Collectors.joining(", ")) + 
                    ") to measure your score gain.");
        }

        double overallScore = result.getScorePercentage() != null ? result.getScorePercentage().doubleValue() : 0.0;
        String performanceBand;
        String resultSummary;

        if (overallScore >= 85.0) {
            performanceBand = "Placement Ready / Advanced";
            resultSummary = "Outstanding mastery demonstrated across tested topics.";
        } else if (overallScore >= 70.0) {
            performanceBand = "Good Performance";
            resultSummary = "Solid grasp of core principles with minor topic-specific improvement opportunities.";
        } else if (overallScore >= 50.0) {
            performanceBand = "Moderate / Developing";
            resultSummary = "Satisfactory conceptual baseline. Recommend targeted revision on highlighted weak areas.";
        } else {
            performanceBand = "Needs Immediate Revision";
            resultSummary = "Accuracy fell below target benchmark. Focus on reviewing foundational definitions and examples.";
        }

        return AssessmentResultResponse.builder()
                .id(result.getId())
                .sessionId(result.getSession().getId())
                .assessmentId(result.getAssessmentDefinition() != null ? result.getAssessmentDefinition().getId() : null)
                .assessmentTitle(result.getAssessmentTitle())
                .category(result.getCategory())
                .totalQuestions(result.getTotalQuestions())
                .correctCount(result.getCorrectCount())
                .incorrectCount(result.getIncorrectCount())
                .unansweredCount(result.getUnansweredCount())
                .totalMarksObtained(result.getTotalMarksObtained())
                .maxMarks(result.getMaxMarks())
                .scorePercentage(result.getScorePercentage())
                .passed(result.isPassed())
                .timeTakenSeconds(result.getTimeTakenSeconds())
                .performanceBand(performanceBand)
                .resultSummary(resultSummary)
                .strengths(strengths)
                .weaknesses(weaknesses)
                .studyRecommendations(studyRecommendations)
                .topicPerformance(topicDtos)
                .difficultyPerformance(diffDtos)
                .questionReviews(reviewDtos)
                .completedAt(result.getCompletedAt())
                .build();
    }

    private List<String> normalizeTopics(List<String> rawTopics) {
        if (rawTopics == null || rawTopics.isEmpty()) return Collections.emptyList();
        return rawTopics.stream()
                .filter(t -> t != null && !t.trim().isEmpty())
                .map(t -> t.trim().toLowerCase())
                .distinct()
                .collect(Collectors.toList());
    }

    private String capitalizeWord(String str) {
        if (str == null || str.isEmpty()) return "";
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

    private static class TopicAccumulator {
        String topic;
        String category;
        int total = 0;
        int correct = 0;

        TopicAccumulator(String topic, String category) {
            this.topic = topic;
            this.category = category;
        }

        void add(boolean isCorrect) {
            total++;
            if (isCorrect) correct++;
        }
    }

    private static class DifficultyAccumulator {
        AssessmentDifficulty difficulty;
        int total = 0;
        int correct = 0;

        DifficultyAccumulator(AssessmentDifficulty difficulty) {
            this.difficulty = difficulty;
        }

        void add(boolean isCorrect) {
            total++;
            if (isCorrect) correct++;
        }
    }
}
