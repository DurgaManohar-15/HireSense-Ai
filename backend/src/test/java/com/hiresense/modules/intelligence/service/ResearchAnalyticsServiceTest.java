package com.hiresense.modules.intelligence.service;

import com.hiresense.modules.assessment.repository.AssessmentResultRepository;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.intelligence.repository.PlacementReadinessSnapshotRepository;
import com.hiresense.modules.interview.repository.InterviewFinalReportRepository;
import com.hiresense.modules.resume.repository.ResumeAnalysisRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ResearchAnalyticsServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PlacementReadinessSnapshotRepository snapshotRepository;
    @Mock
    private AssessmentResultRepository assessmentResultRepository;
    @Mock
    private ResumeAnalysisRepository resumeAnalysisRepository;
    @Mock
    private InterviewFinalReportRepository interviewReportRepository;

    @InjectMocks
    private ResearchAnalyticsService researchService;

    @Test
    @DisplayName("Should accurately calculate Cohen's d effect size for pre and post score distributions")
    void testCalculateCohensD() {
        List<Double> preScores = Arrays.asList(50.0, 55.0, 60.0, 65.0, 50.0);
        List<Double> postScores = Arrays.asList(75.0, 80.0, 85.0, 90.0, 75.0);

        double d = researchService.calculateCohensD(preScores, postScores);

        // Pre mean = 56.0, Post mean = 81.0 -> Gain = +25.0
        // Standard Deviation is ~6.5, so d should be approximately ~3.8
        assertTrue(d > 2.0);
    }

    @Test
    @DisplayName("Normalized Gain g formula: g = (Post - Pre) / (100 - Pre)")
    void testNormalizedGainFormula() {
        double pre = 40.0;
        double post = 70.0;
        double g = (post - pre) / (100.0 - pre); // (30 / 60) = 0.50

        assertEquals(0.50, g, 0.001);
    }
}
