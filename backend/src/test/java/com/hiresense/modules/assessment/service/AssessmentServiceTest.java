package com.hiresense.modules.assessment.service;

import com.hiresense.common.exception.BadRequestException;
import com.hiresense.modules.assessment.dto.AssessmentResultResponse;
import com.hiresense.modules.assessment.dto.AssessmentSessionDto;
import com.hiresense.modules.assessment.dto.SaveAnswerRequest;
import com.hiresense.modules.assessment.dto.StartAssessmentRequest;
import com.hiresense.modules.assessment.model.*;
import com.hiresense.modules.assessment.repository.*;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
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
class AssessmentServiceTest {

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
    private com.hiresense.modules.ai.AIService aiService;

    @InjectMocks
    private AssessmentService assessmentService;

    private User user;
    private AssessmentDefinition definition;
    private Question question1;
    private Question question2;
    private QuestionOption q1OptionA;
    private QuestionOption q1OptionB;
    private AssessmentSession session;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("student@test.com")
                .firstName("John")
                .lastName("Doe")
                .build();

        definition = AssessmentDefinition.builder()
                .id(10L)
                .title("Core CS Diagnostic Test")
                .slug("core-cs-diagnostic-test")
                .description("Diagnostic")
                .category(AssessmentCategory.CORE_CS_TECHNICAL)
                .difficulty(AssessmentDifficulty.MIXED)
                .durationMinutes(20)
                .totalQuestions(2)
                .passingPercentage(new BigDecimal("60.00"))
                .active(true)
                .build();

        question1 = Question.builder()
                .id(101L)
                .category(AssessmentCategory.CORE_CS_TECHNICAL)
                .topic("OOP")
                .difficulty(AssessmentDifficulty.EASY)
                .questionText("What is encapsulation?")
                .explanation("Encapsulation bundles data and methods.")
                .marks(1)
                .active(true)
                .options(new ArrayList<>())
                .build();

        q1OptionA = QuestionOption.builder().id(1001L).question(question1).optionLabel("A").optionText("Data binding").correct(false).build();
        q1OptionB = QuestionOption.builder().id(1002L).question(question1).optionLabel("B").optionText("Data hiding & bundling").correct(true).build();
        question1.getOptions().add(q1OptionA);
        question1.getOptions().add(q1OptionB);

        question2 = Question.builder()
                .id(102L)
                .category(AssessmentCategory.CORE_CS_TECHNICAL)
                .topic("DBMS")
                .difficulty(AssessmentDifficulty.MEDIUM)
                .questionText("What is 2NF?")
                .explanation("Eliminates partial dependency.")
                .marks(1)
                .active(true)
                .options(new ArrayList<>())
                .build();

        session = AssessmentSession.builder()
                .id(500L)
                .user(user)
                .assessmentDefinition(definition)
                .assessmentTitle("Core CS Diagnostic Test")
                .category(AssessmentCategory.CORE_CS_TECHNICAL)
                .status(AssessmentSessionStatus.IN_PROGRESS)
                .totalQuestions(2)
                .durationMinutes(20)
                .startedAt(Instant.now())
                .expiresAt(Instant.now().plus(Duration.ofMinutes(20)))
                .sessionQuestions(new ArrayList<>())
                .responses(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("Should start new timed session and randomize questions")
    void testStartAssessmentSessionSuccess() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(definitionRepository.findById(10L)).thenReturn(Optional.of(definition));
        when(sessionRepository.findFirstByUserIdAndStatus(1L, AssessmentSessionStatus.IN_PROGRESS)).thenReturn(Optional.empty());
        when(questionRepository.findByCategoryAndActiveTrue(AssessmentCategory.CORE_CS_TECHNICAL)).thenReturn(Arrays.asList(question1, question2));
        when(sessionRepository.save(any(AssessmentSession.class))).thenReturn(session);

        StartAssessmentRequest request = StartAssessmentRequest.builder().assessmentDefinitionId(10L).build();
        AssessmentSessionDto result = assessmentService.startAssessmentSession(1L, request);

        assertNotNull(result);
        assertEquals("Core CS Diagnostic Test", result.getAssessmentTitle());
        assertEquals(AssessmentSessionStatus.IN_PROGRESS, result.getStatus());
        verify(sessionRepository, times(1)).save(any(AssessmentSession.class));
    }

    @Test
    @DisplayName("Should evaluate session and accurately calculate score, topic, and difficulty metrics")
    void testSubmitAssessmentCalculatesAccurateScores() {
        SessionQuestion sq1 = SessionQuestion.builder().id(1L).session(session).question(question1).questionOrder(1).build();
        SessionQuestion sq2 = SessionQuestion.builder().id(2L).session(session).question(question2).questionOrder(2).build();

        StudentResponse r1 = StudentResponse.builder().session(session).question(question1).selectedOption(q1OptionB).build(); // correct

        when(sessionRepository.findByIdAndUserId(500L, 1L)).thenReturn(Optional.of(session));
        when(sessionQuestionRepository.findBySessionIdOrderByQuestionOrderAsc(500L)).thenReturn(Arrays.asList(sq1, sq2));
        when(responseRepository.findBySessionId(500L)).thenReturn(Collections.singletonList(r1));
        when(resultRepository.save(any(AssessmentResult.class))).thenAnswer(i -> {
            AssessmentResult r = i.getArgument(0);
            r.setId(999L);
            return r;
        });

        AssessmentResultResponse resultResponse = assessmentService.submitAssessment(500L, 1L);

        assertNotNull(resultResponse);
        assertEquals(2, resultResponse.getTotalQuestions());
        assertEquals(1, resultResponse.getCorrectCount());
        assertEquals(0, resultResponse.getIncorrectCount());
        assertEquals(1, resultResponse.getUnansweredCount());
        assertEquals(new BigDecimal("50.00"), resultResponse.getScorePercentage());
        assertEquals(AssessmentSessionStatus.COMPLETED, session.getStatus());

        verify(resultRepository, times(1)).save(any(AssessmentResult.class));
        verify(topicAnalyticsRepository, times(1)).saveAll(any());
        verify(difficultyAnalyticsRepository, times(1)).saveAll(any());
    }

    @Test
    @DisplayName("Should throw BadRequestException if trying to save answer for expired session")
    void testSaveAnswerExpiredThrowsException() {
        session.setExpiresAt(Instant.now().minus(Duration.ofMinutes(5)));
        when(sessionRepository.findByIdAndUserId(500L, 1L)).thenReturn(Optional.of(session));
        when(sessionQuestionRepository.findBySessionIdOrderByQuestionOrderAsc(500L)).thenReturn(new ArrayList<>());
        when(responseRepository.findBySessionId(500L)).thenReturn(new ArrayList<>());
        when(resultRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        SaveAnswerRequest request = SaveAnswerRequest.builder().questionId(101L).selectedOptionId(1002L).build();

        assertThrows(BadRequestException.class, () -> assessmentService.saveAnswer(500L, 1L, request));
    }
}
