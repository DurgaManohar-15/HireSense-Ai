package com.hiresense.modules.platform.dto;

import com.hiresense.modules.assessment.dto.AssessmentHistorySummaryDto;
import com.hiresense.modules.intelligence.dto.PlacementReadinessDto;
import com.hiresense.modules.intelligence.dto.RoadmapDto;
import com.hiresense.modules.intelligence.dto.SkillGapDto;
import com.hiresense.modules.interview.dto.InterviewHistorySummaryDto;
import com.hiresense.modules.profile.dto.StudentProfileResponse;
import com.hiresense.modules.resume.dto.ResumeDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnifiedStudentDashboardDto {
    private StudentProfileResponse profile;
    private PlacementReadinessDto readiness;
    private RoadmapDto activeRoadmap;

    @Builder.Default
    private List<SkillGapDto> topSkillGaps = new ArrayList<>();

    private AssessmentHistorySummaryDto latestAssessment;
    private ResumeDto activeResume;
    private com.hiresense.modules.resume.dto.ResumeAnalysisResponse latestResumeAnalysis;
    private InterviewHistorySummaryDto latestInterview;

    @Builder.Default
    private List<ActivityTimelineEventDto> recentActivityFeed = new ArrayList<>();

    private long unreadNotificationsCount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityTimelineEventDto {
        private String id;
        private String eventType; // 'ASSESSMENT', 'RESUME', 'INTERVIEW', 'PRS_CALCULATION', 'ROADMAP_TASK'
        private String title;
        private String description;
        private String scoreDisplay;
        private String actionUrl;
        private Instant timestamp;
    }
}
