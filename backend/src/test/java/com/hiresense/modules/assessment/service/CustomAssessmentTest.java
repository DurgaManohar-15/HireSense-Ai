package com.hiresense.modules.assessment.service;

import com.hiresense.common.exception.BadRequestException;
import com.hiresense.common.exception.ResourceNotFoundException;
import com.hiresense.modules.ai.MockAIService;
import com.hiresense.modules.assessment.dto.*;
import com.hiresense.modules.assessment.model.*;
import com.hiresense.modules.assessment.repository.*;
import com.hiresense.modules.assistant.dto.CareerAssistantDtos.ChatResponse;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.intelligence.service.PlacementReadinessCalculatorService;
import com.hiresense.modules.intelligence.service.SkillGapAnalysisService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CustomAssessmentTest {

    @Mock
    private AssessmentDefinitionRepository definitionRepository;
    @Mock
    private QuestionRepository questionRepository;
    @Mock
    private QuestionOptionRepository optionRepository;
    @Mock
    private AssessmentSessionRepository sessionRepository;
    @Mock
    private SessionQuestionRepository sessionQuestionRepository;
    @Mock
    private StudentResponseRepository responseRepository;
    @Mock
    private AssessmentResultRepository resultRepository;
    @Mock
    private TopicPerformanceAnalyticsRepository topicAnalyticsRepository;
    @Mock
    private DifficultyPerformanceAnalyticsRepository difficultyAnalyticsRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PlacementReadinessCalculatorService readinessService;
    @Mock
    private SkillGapAnalysisService skillGapService;
    @Mock
    private com.hiresense.modules.ai.AIService aiService;

    @InjectMocks
    private AssessmentService assessmentService;

    private User studentA;
    private User studentB;
    private Question javaQ1;
    private Question javaQ2;
    private Question dbmsQ1;
    private Question oopQ1;

    @BeforeEach
    void setUp() {
        studentA = User.builder()
                .id(1L)
                .email("studentA@test.com")
                .firstName("Alice")
                .lastName("Student")
                .build();

        studentB = User.builder()
                .id(2L)
                .email("studentB@test.com")
                .firstName("Bob")
                .lastName("Student")
                .build();

        // Setup Questions with educational metadata
        javaQ1 = Question.builder()
                .id(101L)
                .category(AssessmentCategory.CORE_CS_TECHNICAL)
                .topic("Java")
                .difficulty(AssessmentDifficulty.MEDIUM)
                .questionText("In Java, what happens during hash collision in HashMap?")
                .explanation("Entries are chained via a linked list or red-black tree.")
                .example("Map<Key, Value> map = new HashMap<>();")
                .useCase("High-throughput caching and lookup.")
                .marks(1)
                .active(true)
                .options(new ArrayList<>())
                .build();

        QuestionOption j1OptA = QuestionOption.builder().id(1001L).question(javaQ1).optionLabel("A").optionText("Overwrites entry").correct(false).build();
        QuestionOption j1OptB = QuestionOption.builder().id(1002L).question(javaQ1).optionLabel("B").optionText("Chained in bucket").correct(true).build();
        javaQ1.getOptions().addAll(List.of(j1OptA, j1OptB));

        javaQ2 = Question.builder()
                .id(102L)
                .category(AssessmentCategory.CORE_CS_TECHNICAL)
                .topic("Java")
                .difficulty(AssessmentDifficulty.EASY)
                .questionText("Which keyword is used for class inheritance in Java?")
                .explanation("The extends keyword establishes inheritance.")
                .example("class Dog extends Animal {}")
                .useCase("Object-oriented code reuse and polymorphism.")
                .marks(1)
                .active(true)
                .options(new ArrayList<>())
                .build();

        QuestionOption j2OptA = QuestionOption.builder().id(1003L).question(javaQ2).optionLabel("A").optionText("implements").correct(false).build();
        QuestionOption j2OptB = QuestionOption.builder().id(1004L).question(javaQ2).optionLabel("B").optionText("extends").correct(true).build();
        javaQ2.getOptions().addAll(List.of(j2OptA, j2OptB));

        dbmsQ1 = Question.builder()
                .id(103L)
                .category(AssessmentCategory.CORE_CS_TECHNICAL)
                .topic("DBMS")
                .difficulty(AssessmentDifficulty.MEDIUM)
                .questionText("What does 2NF eliminate?")
                .explanation("2NF eliminates partial dependency on composite candidate keys.")
                .example("Splitting student courses from student grades.")
                .useCase("Relational database schema normalization.")
                .marks(1)
                .active(true)
                .options(new ArrayList<>())
                .build();

        QuestionOption db1OptA = QuestionOption.builder().id(1005L).question(dbmsQ1).optionLabel("A").optionText("Transitive dependency").correct(false).build();
        QuestionOption db1OptB = QuestionOption.builder().id(1006L).question(dbmsQ1).optionLabel("B").optionText("Partial dependency").correct(true).build();
        dbmsQ1.getOptions().addAll(List.of(db1OptA, db1OptB));

        oopQ1 = Question.builder()
                .id(104L)
                .category(AssessmentCategory.CORE_CS_TECHNICAL)
                .topic("OOP")
                .difficulty(AssessmentDifficulty.MEDIUM)
                .questionText("What is encapsulation?")
                .explanation("Bundling data and methods into a single unit.")
                .example("Private fields with public getters and setters.")
                .useCase("Information hiding and data protection.")
                .marks(1)
                .active(true)
                .options(new ArrayList<>())
                .build();

        QuestionOption oop1OptA = QuestionOption.builder().id(1007L).question(oopQ1).optionLabel("A").optionText("Polymorphism").correct(false).build();
        QuestionOption oop1OptB = QuestionOption.builder().id(1008L).question(oopQ1).optionLabel("B").optionText("Encapsulation").correct(true).build();
        oopQ1.getOptions().addAll(List.of(oop1OptA, oop1OptB));
    }

    @Test
    @DisplayName("1. Topic Selection & Availability Checking — Returns accurate counts and alerts")
    void testQuestionAvailabilityCheck() {
        when(questionRepository.findByTopicsAndDifficulty(List.of("java", "dbms"), AssessmentDifficulty.MEDIUM))
                .thenReturn(List.of(javaQ1, dbmsQ1));

        CustomAssessmentConfigRequest request = CustomAssessmentConfigRequest.builder()
                .topics(List.of("Java", "DBMS"))
                .difficulty(AssessmentDifficulty.MEDIUM)
                .questionCount(5)
                .build();

        AssessmentAvailabilityDto result = assessmentService.checkQuestionAvailability(request);

        assertNotNull(result);
        assertEquals(2, result.getAvailableCount());
        assertEquals(5, result.getRequestedCount());
        assertFalse(result.isSufficient());
        assertTrue(result.getMessage().contains("Only 2 suitable questions"));
        assertEquals(1, result.getTopicBreakdown().get("Java"));
        assertEquals(1, result.getTopicBreakdown().get("DBMS"));
    }

    @Test
    @DisplayName("2. Insufficient Question Handling — Throws exception when count unavailable without auto-adjust")
    void testStartCustomAssessmentInsufficientQuestionsThrows() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(studentA));
        when(sessionRepository.findFirstByUserIdAndStatus(1L, AssessmentSessionStatus.IN_PROGRESS)).thenReturn(Optional.empty());
        when(questionRepository.findByTopicsAndDifficulty(List.of("java"), AssessmentDifficulty.MEDIUM))
                .thenReturn(Collections.emptyList());
        when(aiService.generateAssessmentQuestions(any(), any(), anyInt()))
                .thenReturn(Collections.emptyList());

        CustomAssessmentConfigRequest request = CustomAssessmentConfigRequest.builder()
                .topics(List.of("Java"))
                .difficulty(AssessmentDifficulty.MEDIUM)
                .questionCount(10)
                .autoAdjustIfInsufficient(false)
                .build();

        assertThrows(BadRequestException.class, () -> assessmentService.startCustomAssessmentSession(1L, request));
    }

    @Test
    @DisplayName("3. Multi-Topic Selection & Safe Question View — Correct answers concealed during active test")
    void testStartCustomAssessmentSessionMultiTopicSafe() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(studentA));
        when(sessionRepository.findFirstByUserIdAndStatus(1L, AssessmentSessionStatus.IN_PROGRESS)).thenReturn(Optional.empty());
        when(questionRepository.findByTopicsAndDifficulty(List.of("java", "dbms", "oop"), AssessmentDifficulty.MEDIUM))
                .thenReturn(List.of(javaQ1, dbmsQ1, oopQ1));
        when(sessionRepository.save(any(AssessmentSession.class))).thenAnswer(i -> {
            AssessmentSession s = i.getArgument(0);
            s.setId(888L);
            return s;
        });

        CustomAssessmentConfigRequest request = CustomAssessmentConfigRequest.builder()
                .topics(List.of("Java", "DBMS", "OOP"))
                .difficulty(AssessmentDifficulty.MEDIUM)
                .questionCount(3)
                .durationMinutes(15)
                .build();

        AssessmentSessionDto sessionDto = assessmentService.startCustomAssessmentSession(1L, request);

        assertNotNull(sessionDto);
        assertEquals(3, sessionDto.getTotalQuestions());
        assertEquals(AssessmentSessionStatus.IN_PROGRESS, sessionDto.getStatus());
        assertTrue(sessionDto.getAssessmentTitle().contains("Java, DBMS, OOP"));

        // Verify correct answers are strictly null/hidden during active session
        for (QuestionDto q : sessionDto.getQuestions()) {
            for (QuestionOptionDto opt : q.getOptions()) {
                assertNull(opt.getCorrect(), "Correct answer must NEVER be revealed during active assessment!");
            }
        }

        verify(sessionQuestionRepository, times(1)).saveAll(any());
    }

    @Test
    @DisplayName("4. Deterministic Scoring, Explanations, Examples, Use Cases, & Learning Recommendations")
    void testSubmitAssessmentFullLearningReport() {
        AssessmentSession session = AssessmentSession.builder()
                .id(900L)
                .user(studentA)
                .assessmentTitle("Custom Assessment: Java, DBMS")
                .category(AssessmentCategory.CORE_CS_TECHNICAL)
                .status(AssessmentSessionStatus.IN_PROGRESS)
                .totalQuestions(2)
                .durationMinutes(20)
                .startedAt(Instant.now().minus(Duration.ofMinutes(10)))
                .expiresAt(Instant.now().plus(Duration.ofMinutes(10)))
                .build();

        SessionQuestion sq1 = SessionQuestion.builder().id(1L).session(session).question(javaQ1).questionOrder(1).build();
        SessionQuestion sq2 = SessionQuestion.builder().id(2L).session(session).question(dbmsQ1).questionOrder(2).build();

        // Java: correct answer (Option B)
        StudentResponse r1 = StudentResponse.builder().session(session).question(javaQ1).selectedOption(javaQ1.getOptions().get(1)).build();
        // DBMS: incorrect answer (Option A)
        StudentResponse r2 = StudentResponse.builder().session(session).question(dbmsQ1).selectedOption(dbmsQ1.getOptions().get(0)).build();

        when(sessionRepository.findByIdAndUserId(900L, 1L)).thenReturn(Optional.of(session));
        when(sessionQuestionRepository.findBySessionIdOrderByQuestionOrderAsc(900L)).thenReturn(List.of(sq1, sq2));
        when(responseRepository.findBySessionId(900L)).thenReturn(List.of(r1, r2));
        when(resultRepository.save(any(AssessmentResult.class))).thenAnswer(i -> {
            AssessmentResult r = i.getArgument(0);
            r.setId(9999L);
            return r;
        });

        AssessmentResultResponse result = assessmentService.submitAssessment(900L, 1L);

        assertNotNull(result);
        assertEquals(2, result.getTotalQuestions());
        assertEquals(1, result.getCorrectCount());
        assertEquals(1, result.getIncorrectCount());
        assertEquals(0, result.getUnansweredCount());
        assertEquals(new BigDecimal("50.00"), result.getScorePercentage());

        // Verify Strengths and Weaknesses
        assertFalse(result.getWeaknesses().isEmpty(), "DBMS should be identified as a weak area (< 70%)");
        assertTrue(result.getWeaknesses().get(0).contains("DBMS"));
        assertFalse(result.getStrengths().isEmpty(), "Java should be identified as a strong area (100%)");
        assertTrue(result.getStrengths().get(0).contains("Java"));

        // Verify "What Should You Study Next?" personalized recommendations
        assertFalse(result.getStudyRecommendations().isEmpty());
        assertTrue(result.getStudyRecommendations().stream().anyMatch(rec -> rec.contains("DBMS")));

        // Verify Question-by-Question Review with educational fields
        assertEquals(2, result.getQuestionReviews().size());
        QuestionReviewDto javaReview = result.getQuestionReviews().get(0);
        assertTrue(javaReview.isCorrect());
        assertNotNull(javaReview.getExplanation());
        assertNotNull(javaReview.getExample());
        assertNotNull(javaReview.getUseCase());

        QuestionReviewDto dbmsReview = result.getQuestionReviews().get(1);
        assertFalse(dbmsReview.isCorrect());
        assertNotNull(dbmsReview.getWhyIncorrectExplanation(), "Must provide diagnostic reason for incorrect choice");
        assertTrue(dbmsReview.getWhyIncorrectExplanation().contains("You selected (A)"));

        // Verify automatic recalculation of PRS & Skill Gaps
        verify(skillGapService, times(1)).evaluateAndPersistSkillGaps(1L);
        verify(readinessService, times(1)).calculateAndPersistReadiness(1L);
    }

    @Test
    @DisplayName("5. Server-Controlled Timer Auto-Submission — Expired session evaluates automatically")
    void testTimerExpiredAutoSubmission() {
        AssessmentSession expiredSession = AssessmentSession.builder()
                .id(777L)
                .user(studentA)
                .assessmentTitle("Timed Java Assessment")
                .category(AssessmentCategory.CORE_CS_TECHNICAL)
                .status(AssessmentSessionStatus.IN_PROGRESS)
                .totalQuestions(1)
                .durationMinutes(10)
                .startedAt(Instant.now().minus(Duration.ofMinutes(25)))
                .expiresAt(Instant.now().minus(Duration.ofMinutes(15))) // Expired 15 mins ago
                .build();

        when(sessionRepository.findByIdAndUserId(777L, 1L)).thenReturn(Optional.of(expiredSession));
        when(sessionQuestionRepository.findBySessionIdOrderByQuestionOrderAsc(777L)).thenReturn(new ArrayList<>());
        when(responseRepository.findBySessionId(777L)).thenReturn(new ArrayList<>());
        when(resultRepository.save(any(AssessmentResult.class))).thenAnswer(i -> {
            AssessmentResult r = i.getArgument(0);
            r.setId(555L);
            return r;
        });

        AssessmentSessionDto activeSession = assessmentService.getActiveSession(777L, 1L);

        assertEquals(AssessmentSessionStatus.COMPLETED, expiredSession.getStatus());
        verify(resultRepository, times(1)).save(any(AssessmentResult.class));
    }

    @Test
    @DisplayName("6. Security & Result Ownership — Student A cannot access Student B's session or results")
    void testSecuritySessionIsolation() {
        when(sessionRepository.findByIdAndUserId(500L, 2L)).thenReturn(Optional.empty());
        when(resultRepository.findByIdAndUserId(999L, 2L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> assessmentService.getActiveSession(500L, 2L));
        assertThrows(ResourceNotFoundException.class, () -> assessmentService.getResultById(999L, 2L));
    }

    @Test
    @DisplayName("7. Multi-Student Differential Personalization — Student A (weak DBMS) vs Student B (weak Java)")
    void testMultiStudentDifferentialPersonalization() {
        MockAIService mockAI = new MockAIService(null, null, null);

        // Student A: Strong Java (verified strength), Weak DBMS (topGap: "DBMS (Gap: -40%)")
        ChatResponse studentAResponse = mockAI.chatCareerAssistant(
                "Conduct an assessment for me",
                "Software Engineer",
                "Google",
                65,
                70,
                "Developing",
                "Java",
                "DBMS",
                List.of("DBMS (Gap: -40%)"),
                "3/10 tasks",
                Collections.emptyList()
        );

        assertNotNull(studentAResponse.getAssessmentRecommendation());
        assertEquals("DBMS", studentAResponse.getAssessmentRecommendation().getTopics().get(0));
        assertTrue(studentAResponse.getAssistantReply().contains("DBMS"));

        // Student B: Strong DBMS (verified strength), Weak Java (topGap: "Java (Gap: -45%)")
        ChatResponse studentBResponse = mockAI.chatCareerAssistant(
                "Conduct an assessment for me",
                "Backend Engineer",
                "Amazon",
                60,
                65,
                "Developing",
                "DBMS",
                "Java",
                List.of("Java (Gap: -45%)"),
                "2/10 tasks",
                Collections.emptyList()
        );

        assertNotNull(studentBResponse.getAssessmentRecommendation());
        assertEquals("Java", studentBResponse.getAssessmentRecommendation().getTopics().get(0));
        assertTrue(studentBResponse.getAssistantReply().contains("Java"));

        // Ensure recommendations are strictly separate and personalized
        assertNotEquals(
                studentAResponse.getAssessmentRecommendation().getTopics().get(0),
                studentBResponse.getAssessmentRecommendation().getTopics().get(0),
                "Student A and Student B must receive distinct recommendations tailored to their unique skill gaps!"
        );
    }
}
