package com.hiresense.modules.platform.service;

import com.hiresense.modules.assessment.dto.AssessmentHistorySummaryDto;
import com.hiresense.modules.assessment.model.AssessmentResult;
import com.hiresense.modules.assessment.repository.AssessmentResultRepository;
import com.hiresense.modules.intelligence.dto.PlacementReadinessDto;
import com.hiresense.modules.intelligence.dto.RoadmapDto;
import com.hiresense.modules.intelligence.dto.SkillGapDto;
import com.hiresense.modules.intelligence.model.PlacementReadinessSnapshot;
import com.hiresense.modules.intelligence.repository.PlacementReadinessSnapshotRepository;
import com.hiresense.modules.intelligence.service.PlacementReadinessCalculatorService;
import com.hiresense.modules.intelligence.service.RoadmapService;
import com.hiresense.modules.intelligence.service.SkillGapAnalysisService;
import com.hiresense.modules.interview.dto.InterviewHistorySummaryDto;
import com.hiresense.modules.interview.model.Interview;
import com.hiresense.modules.interview.repository.InterviewRepository;
import com.hiresense.modules.platform.dto.UnifiedStudentDashboardDto;
import com.hiresense.modules.platform.dto.UnifiedStudentDashboardDto.ActivityTimelineEventDto;
import com.hiresense.modules.platform.repository.NotificationRepository;
import com.hiresense.modules.profile.dto.StudentProfileResponse;
import com.hiresense.modules.profile.model.StudentProfile;
import com.hiresense.modules.profile.repository.StudentProfileRepository;
import com.hiresense.modules.profile.service.StudentProfileService;
import com.hiresense.modules.resume.dto.ResumeDto;
import com.hiresense.modules.resume.service.ResumeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UnifiedStudentDashboardService {

    private final StudentProfileRepository profileRepository;
    private final StudentProfileService profileService;
    private final PlacementReadinessCalculatorService readinessService;
    private final SkillGapAnalysisService skillGapService;
    private final RoadmapService roadmapService;
    private final AssessmentResultRepository assessmentResultRepository;
    private final ResumeService resumeService;
    private final InterviewRepository interviewRepository;
    private final PlacementReadinessSnapshotRepository snapshotRepository;
    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public UnifiedStudentDashboardDto getUnifiedDashboard(Long userId) {
        StudentProfileResponse profile = null;
        if (profileRepository.findByUserId(userId).isPresent()) {
            profile = profileService.getProfileByUserId(userId);
        }

        PlacementReadinessDto readiness = readinessService.getLatestReadiness(userId);
        RoadmapDto roadmap = roadmapService.getCurrentRoadmap(userId);
        List<SkillGapDto> skillGaps = skillGapService.getSkillGaps(userId);
        List<SkillGapDto> topGaps = skillGaps.stream().filter(g -> g.getGapScore() > 0).limit(4).toList();

        // Latest assessment
        List<AssessmentResult> results = assessmentResultRepository.findByUserIdOrderByCompletedAtDesc(userId);
        AssessmentHistorySummaryDto latestAssessment = null;
        if (!results.isEmpty()) {
            AssessmentResult r = results.get(0);
            latestAssessment = AssessmentHistorySummaryDto.builder()
                    .id(r.getId())
                    .assessmentTitle(r.getAssessmentTitle())
                    .category(r.getCategory())
                    .scorePercentage(r.getScorePercentage())
                    .passed(r.isPassed())
                    .completedAt(r.getCompletedAt())
                    .build();
        }

        // Active resume & analysis
        List<ResumeDto> resumesList = resumeService.getMyResumes(userId);
        ResumeDto activeResume = resumesList.isEmpty() ? null : resumesList.get(0);
        List<com.hiresense.modules.resume.dto.ResumeAnalysisResponse> analysisHistory = resumeService.getAnalysisHistory(userId);
        com.hiresense.modules.resume.dto.ResumeAnalysisResponse latestAnalysis = analysisHistory.isEmpty() ? null : analysisHistory.get(0);

        // Latest interview
        List<Interview> interviews = interviewRepository.findByUserIdOrderByStartedAtDesc(userId);
        InterviewHistorySummaryDto latestInterview = null;
        if (!interviews.isEmpty()) {
            Interview i = interviews.get(0);
            latestInterview = InterviewHistorySummaryDto.builder()
                    .id(i.getId())
                    .interviewType(i.getInterviewType())
                    .difficulty(i.getDifficulty())
                    .targetRole(i.getTargetRole())
                    .targetCompany(i.getTargetCompany())
                    .status(i.getStatus())
                    .startedAt(i.getStartedAt())
                    .completedAt(i.getCompletedAt())
                    .build();
        }

        long unreadCount = notificationRepository.countByUserIdAndReadFalse(userId);

        // Build Real Chronological Activity Timeline Feed
        List<ActivityTimelineEventDto> timeline = new ArrayList<>();

        for (AssessmentResult ar : results) {
            timeline.add(ActivityTimelineEventDto.builder()
                    .id("ACT_ASSESS_" + ar.getId())
                    .eventType("ASSESSMENT")
                    .title("Completed " + ar.getAssessmentTitle())
                    .description("Scored " + ar.getScorePercentage() + "% (" + (ar.isPassed() ? "Passed" : "Needs Review") + ")")
                    .scoreDisplay(ar.getScorePercentage() + "%")
                    .actionUrl("/assessments/results/" + ar.getId())
                    .timestamp(ar.getCompletedAt())
                    .build());
        }

        for (ResumeDto res : resumesList) {
            timeline.add(ActivityTimelineEventDto.builder()
                    .id("ACT_RESUME_" + res.getId())
                    .eventType("RESUME")
                    .title("Uploaded Resume (v" + res.getVersionNumber() + ")")
                    .description(res.isAnalyzed() ? "ATS Diagnostic Analysis Completed" : "Uploaded & Ready for Analysis")
                    .actionUrl("/resume")
                    .timestamp(res.getCreatedAt())
                    .build());
        }

        for (Interview inv : interviews) {
            timeline.add(ActivityTimelineEventDto.builder()
                    .id("ACT_INT_" + inv.getId())
                    .eventType("INTERVIEW")
                    .title("AI Mock Interview (" + inv.getInterviewType().name().replace('_', ' ') + ")")
                    .description("Status: " + inv.getStatus().name() + " • " + inv.getTargetRole())
                    .actionUrl("/interview/results/" + inv.getId())
                    .timestamp(inv.getStartedAt())
                    .build());
        }

        List<PlacementReadinessSnapshot> snaps = snapshotRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (PlacementReadinessSnapshot sn : snaps) {
            if (sn.getPrsScore() > 0 || sn.getConfidenceScore() > 0) {
                timeline.add(ActivityTimelineEventDto.builder()
                        .id("ACT_PRS_" + sn.getId())
                        .eventType("PRS_CALCULATION")
                        .title("Readiness Score Calibrated (" + sn.getPrsScore() + "%)")
                        .description(sn.getReadinessBand().getDisplayName() + " • Confidence: " + sn.getConfidenceScore() + "%")
                        .scoreDisplay(sn.getPrsScore() + "%")
                        .actionUrl("/readiness")
                        .timestamp(sn.getCreatedAt())
                        .build());
            }
        }

        timeline.sort(Comparator.comparing(ActivityTimelineEventDto::getTimestamp, Comparator.nullsLast(Comparator.reverseOrder())));
        List<ActivityTimelineEventDto> recentFeed = timeline.stream().limit(8).toList();

        return UnifiedStudentDashboardDto.builder()
                .profile(profile)
                .readiness(readiness)
                .activeRoadmap(roadmap)
                .topSkillGaps(topGaps)
                .latestAssessment(latestAssessment)
                .activeResume(activeResume)
                .latestResumeAnalysis(latestAnalysis)
                .latestInterview(latestInterview)
                .recentActivityFeed(recentFeed)
                .unreadNotificationsCount(unreadCount)
                .build();
    }
}
