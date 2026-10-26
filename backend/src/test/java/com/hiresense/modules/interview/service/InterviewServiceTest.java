package com.hiresense.modules.interview.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiresense.common.exception.BadRequestException;
import com.hiresense.common.exception.ResourceNotFoundException;
import com.hiresense.modules.ai.AIService;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.interview.dto.*;
import com.hiresense.modules.interview.model.*;
import com.hiresense.modules.interview.repository.*;
import com.hiresense.modules.profile.repository.StudentProfileRepository;
import com.hiresense.modules.resume.repository.ResumeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InterviewServiceTest {

    @Mock
    private InterviewRepository interviewRepository;
    @Mock
    private InterviewQuestionRepository questionRepository;
    @Mock
    private InterviewAnswerRepository answerRepository;
    @Mock
    private InterviewTurnEvaluationRepository evaluationRepository;
    @Mock
    private InterviewFinalReportRepository finalReportRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private StudentProfileRepository profileRepository;
    @Mock
    private ResumeRepository resumeRepository;
    @Mock
    private AIService aiService;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private InterviewService interviewService;

    private User user;
    private Interview sampleInterview;
    private InterviewQuestion sampleQuestion1;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("student@hiresense.ai")
                .firstName("Jane")
                .lastName("Doe")
                .build();

        sampleInterview = Interview.builder()
                .id(10L)
                .user(user)
                .interviewType(InterviewType.TECHNICAL)
                .difficulty(InterviewDifficulty.ADAPTIVE)
                .targetRole("Java Developer")
                .targetCompany("Acme Corp")
                .totalQuestions(3)
                .currentQuestionIndex(1)
                .status(InterviewStatus.IN_PROGRESS)
                .aiProvider("MOCK")
                .aiModel("mock-v1")
                .startedAt(Instant.now())
                .build();

        sampleQuestion1 = InterviewQuestion.builder()
                .id(101L)
                .interview(sampleInterview)
                .sequenceNumber(1)
                .category("TECHNICAL")
                .topic("OOP Fundamentals")
                .difficulty(InterviewDifficulty.MEDIUM)
                .questionText("Explain Polymorphism and Encapsulation.")
                .build();
    }

    @Test
    @DisplayName("Should successfully start an interview session and generate Question 1")
    void testStartInterviewSuccess() {
        StartInterviewRequest req = StartInterviewRequest.builder()
                .interviewType(InterviewType.TECHNICAL)
                .difficulty(InterviewDifficulty.ADAPTIVE)
                .targetRole("Software Engineer")
                .targetCompany("TechCorp")
                .totalQuestions(3)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(interviewRepository.findFirstByUserIdAndStatus(1L, InterviewStatus.IN_PROGRESS)).thenReturn(Optional.empty());
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(resumeRepository.findFirstByUserIdAndActiveTrueOrderByVersionNumberDesc(1L)).thenReturn(Optional.empty());
        when(interviewRepository.save(any(Interview.class))).thenReturn(sampleInterview);

        InterviewQuestionDto qDto = InterviewQuestionDto.builder()
                .sequenceNumber(1)
                .category("TECHNICAL")
                .topic("OOP Fundamentals")
                .difficulty(InterviewDifficulty.MEDIUM)
                .questionText("Explain Polymorphism.")
                .build();

        when(aiService.generateInterviewQuestion(any(), any(), any(), any(), any(), eq(1), eq(3), any(), any(), any(), any(), any()))
                .thenReturn(qDto);
        when(questionRepository.save(any(InterviewQuestion.class))).thenReturn(sampleQuestion1);

        InterviewSessionDto session = interviewService.startInterview(1L, req);

        assertNotNull(session);
        assertEquals(10L, session.getId());
        assertEquals(InterviewStatus.IN_PROGRESS, session.getStatus());
        assertEquals("Explain Polymorphism.", session.getCurrentQuestion().getQuestionText());
        verify(questionRepository, times(1)).save(any(InterviewQuestion.class));
    }

    @Test
    @DisplayName("Should evaluate turn answer and advance to next question")
    void testSubmitAnswerAdvancesToNextQuestion() {
        SubmitAnswerRequest req = SubmitAnswerRequest.builder()
                .questionId(101L)
                .answerText("Polymorphism allows objects to take many forms, while encapsulation hides internal state.")
                .timeTakenSeconds(25)
                .build();

        when(interviewRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(sampleInterview));
        when(questionRepository.findById(101L)).thenReturn(Optional.of(sampleQuestion1));
        when(answerRepository.findByInterviewIdAndQuestionId(10L, 101L)).thenReturn(Optional.empty());

        TurnEvaluationDto evalDto = TurnEvaluationDto.builder()
                .relevanceScore(85)
                .technicalCorrectnessScore(80)
                .completenessScore(75)
                .clarityScore(85)
                .communicationScore(80)
                .overallTurnScore(81)
                .strengths(List.of("Good concise explanation"))
                .build();

        when(aiService.evaluateInterviewAnswer(any(), any(), any(), any())).thenReturn(evalDto);

        InterviewQuestionDto q2Dto = InterviewQuestionDto.builder()
                .sequenceNumber(2)
                .category("TECHNICAL")
                .topic("Database Indexing")
                .difficulty(InterviewDifficulty.HARD)
                .questionText("Explain B-Trees in database indexing.")
                .build();

        when(aiService.generateInterviewQuestion(any(), any(), any(), any(), any(), eq(2), eq(3), any(), any(), any(), any(), eq(81)))
                .thenReturn(q2Dto);

        InterviewQuestion q2 = InterviewQuestion.builder()
                .id(102L)
                .interview(sampleInterview)
                .sequenceNumber(2)
                .category("TECHNICAL")
                .topic("Database Indexing")
                .difficulty(InterviewDifficulty.HARD)
                .questionText("Explain B-Trees in database indexing.")
                .build();

        when(questionRepository.save(any(InterviewQuestion.class))).thenReturn(q2);

        SubmitAnswerResponse res = interviewService.submitAnswer(10L, 1L, req);

        assertNotNull(res);
        assertFalse(res.isFinished());
        assertEquals(81, res.getTurnEvaluation().getOverallTurnScore());
        assertEquals(2, res.getNextQuestion().getSequenceNumber());
        assertEquals("Explain B-Trees in database indexing.", res.getNextQuestion().getQuestionText());
    }

    @Test
    @DisplayName("Should finalize interview and generate final report on answering last question")
    void testSubmitAnswerFinalizesInterviewOnLastQuestion() {
        InterviewQuestion question3 = InterviewQuestion.builder()
                .id(103L)
                .interview(sampleInterview)
                .sequenceNumber(3) // Last question (total = 3)
                .category("TECHNICAL")
                .topic("Concurrency")
                .questionText("Explain thread safety.")
                .build();

        SubmitAnswerRequest req = SubmitAnswerRequest.builder()
                .questionId(103L)
                .answerText("Thread safety ensures shared state is accessed safely across threads using synchronization.")
                .build();

        when(interviewRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(sampleInterview));
        when(questionRepository.findById(103L)).thenReturn(Optional.of(question3));
        when(answerRepository.findByInterviewIdAndQuestionId(10L, 103L)).thenReturn(Optional.empty());

        TurnEvaluationDto evalDto = TurnEvaluationDto.builder()
                .overallTurnScore(85)
                .relevanceScore(85)
                .technicalCorrectnessScore(85)
                .completenessScore(80)
                .clarityScore(85)
                .communicationScore(85)
                .build();

        when(aiService.evaluateInterviewAnswer(any(), any(), any(), any())).thenReturn(evalDto);

        InterviewFinalReportDto reportDto = InterviewFinalReportDto.builder()
                .overallScore(84)
                .technicalScore(83)
                .behavioralScore(85)
                .communicationScore(85)
                .summaryEvaluation("Candidate demonstrated solid technical foundations.")
                .keyStrengths(List.of("Strong OOP and concurrency fundamentals"))
                .build();

        when(aiService.generateFinalInterviewReport(any(), any(), any(), any())).thenReturn(reportDto);

        SubmitAnswerResponse res = interviewService.submitAnswer(10L, 1L, req);

        assertNotNull(res);
        assertTrue(res.isFinished());
        assertEquals(InterviewStatus.COMPLETED, sampleInterview.getStatus());
        verify(finalReportRepository, times(1)).save(any(InterviewFinalReport.class));
    }

    @Test
    @DisplayName("IDOR Protection: Accessing another student's interview session throws ResourceNotFoundException")
    void testIdorProtectionOnInterviewSession() {
        when(interviewRepository.findByIdAndUserId(10L, 999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> interviewService.getInterviewSession(10L, 999L));
    }

    @Test
    @DisplayName("Security: Submitting duplicate answer to same question throws BadRequestException")
    void testDuplicateAnswerThrowsBadRequestException() {
        SubmitAnswerRequest req = SubmitAnswerRequest.builder()
                .questionId(101L)
                .answerText("Duplicate answer attempt")
                .build();

        when(interviewRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(sampleInterview));
        when(questionRepository.findById(101L)).thenReturn(Optional.of(sampleQuestion1));
        when(answerRepository.findByInterviewIdAndQuestionId(10L, 101L))
                .thenReturn(Optional.of(InterviewAnswer.builder().id(500L).build()));

        assertThrows(BadRequestException.class, () -> interviewService.submitAnswer(10L, 1L, req));
    }
}
