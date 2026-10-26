package com.hiresense.modules.intelligence.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiresense.modules.assessment.model.AssessmentResult;
import com.hiresense.modules.assessment.repository.AssessmentResultRepository;
import com.hiresense.modules.assessment.repository.TopicPerformanceAnalyticsRepository;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.profile.model.StudentProfile;
import com.hiresense.modules.profile.model.TargetCompany;
import com.hiresense.modules.profile.repository.StudentProfileRepository;
import com.hiresense.modules.profile.repository.TargetCompanyRepository;
import com.hiresense.modules.intelligence.dto.PlacementReadinessDto;
import com.hiresense.modules.intelligence.model.PlacementReadinessSnapshot;
import com.hiresense.modules.intelligence.model.ReadinessBand;
import com.hiresense.modules.intelligence.repository.PlacementReadinessSnapshotRepository;
import com.hiresense.modules.interview.model.InterviewFinalReport;
import com.hiresense.modules.interview.repository.InterviewFinalReportRepository;
import com.hiresense.modules.resume.model.ResumeAnalysis;
import com.hiresense.modules.resume.repository.ResumeAnalysisRepository;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlacementReadinessCalculatorServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private StudentProfileRepository profileRepository;
    @Mock
    private AssessmentResultRepository assessmentResultRepository;
    @Mock
    private TopicPerformanceAnalyticsRepository topicAnalyticsRepository;
    @Mock
    private ResumeAnalysisRepository resumeAnalysisRepository;
    @Mock
    private InterviewFinalReportRepository interviewReportRepository;
    @Mock
    private TargetCompanyRepository companyRepository;
    @Mock
    private PlacementReadinessSnapshotRepository snapshotRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private PlacementReadinessCalculatorService readinessService;

    private User user;
    private StudentProfile sampleProfile;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("student@hiresense.ai").firstName("Jane").build();
        sampleProfile = StudentProfile.builder().id(10L).user(user).targetRole("Backend Engineer").build();
    }

    @Test
    @DisplayName("Should compute PRS with all available dimensions and normalize weights correctly")
    void testCalculateReadinessAllDimensions() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleProfile));

        // Aptitude & Tech Assessment (80%)
        AssessmentResult ar = AssessmentResult.builder()
                .id(100L)
                .scorePercentage(new java.math.BigDecimal("80.00"))
                .completedAt(Instant.now())
                .build();
        when(assessmentResultRepository.findByUserIdOrderByCompletedAtDesc(1L)).thenReturn(List.of(ar));
        when(topicAnalyticsRepository.findByUserId(1L)).thenReturn(Collections.emptyList());

        // Resume (85%)
        ResumeAnalysis ra = ResumeAnalysis.builder().id(200L).overallScore(85).build();
        when(resumeAnalysisRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(ra));

        // Interview & Communication (75% & 80%)
        InterviewFinalReport ifr = InterviewFinalReport.builder()
                .id(300L)
                .overallScore(75)
                .communicationScore(80)
                .build();
        when(interviewReportRepository.findByUserIdOrderByCompletedAtDesc(1L)).thenReturn(List.of(ifr));

        when(snapshotRepository.save(any(PlacementReadinessSnapshot.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        PlacementReadinessDto dto = readinessService.calculateAndPersistReadiness(1L);

        assertNotNull(dto);
        assertTrue(dto.getPrsScore() >= 70 && dto.getPrsScore() <= 90);
        assertTrue(dto.getConfidenceScore() >= 50);
        assertEquals(ReadinessBand.GOOD, dto.getReadinessBand());
        assertNotNull(dto.getExplanationSummary());
        verify(snapshotRepository, times(1)).save(any(PlacementReadinessSnapshot.class));
    }

    @Test
    @DisplayName("Should handle missing components transparently without fake scores and penalize confidence")
    void testMissingComponentsHandledGracefully() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());

        // Only Resume is available
        ResumeAnalysis ra = ResumeAnalysis.builder().id(200L).overallScore(90).build();
        when(resumeAnalysisRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(ra));
        when(assessmentResultRepository.findByUserIdOrderByCompletedAtDesc(1L)).thenReturn(Collections.emptyList());
        when(topicAnalyticsRepository.findByUserId(1L)).thenReturn(Collections.emptyList());
        when(interviewReportRepository.findByUserIdOrderByCompletedAtDesc(1L)).thenReturn(Collections.emptyList());

        when(snapshotRepository.save(any(PlacementReadinessSnapshot.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        PlacementReadinessDto dto = readinessService.calculateAndPersistReadiness(1L);

        assertNotNull(dto);
        assertEquals(90, dto.getPrsScore()); // 100% of available weight
        assertNull(dto.getCodingScore());
        assertNull(dto.getTechnicalScore());
        assertNull(dto.getAptitudeScore());
        assertNull(dto.getInterviewScore());
        // Low confidence because only 1 dimension is present
        assertTrue(dto.getConfidenceScore() < 40);
        assertTrue(dto.getExplanationSummary().contains("limited diagnostic evidence"));
    }
}
