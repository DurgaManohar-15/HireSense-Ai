package com.hiresense.modules.platform.dto.admin;

import com.hiresense.modules.intelligence.dto.PlacementReadinessDto;
import com.hiresense.modules.intelligence.dto.SkillGapDto;
import com.hiresense.modules.profile.dto.StudentProfileResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class AdminStudentDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentSummary {
        private Long id;
        private String name;
        private String email;
        private String degree;
        private Integer graduationYear;
        private String targetRole;
        private String targetCompany;
        private Integer prsScore;
        private Integer confidenceScore;
        private String readinessBand;
        private int assessmentsCompleted;
        private int interviewsCompleted;
        private boolean hasResume;
        private Instant lastActive;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentDetail {
        private Long id;
        private String name;
        private String email;
        private StudentProfileResponse profile;
        private PlacementReadinessDto readiness;

        @Builder.Default
        private List<SkillGapDto> skillGaps = new ArrayList<>();

        private int assessmentCount;
        private int resumeCount;
        private int interviewCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CohortAnalytics {
        private long totalStudents;
        private long activeStudents;
        private double averagePrs;
        private double averageConfidence;
        private double assessmentParticipationRate;
        private double resumeParticipationRate;
        private double interviewParticipationRate;

        // Band distribution counts
        private Map<String, Long> readinessBandCounts;

        // Most common cohort skill gaps
        @Builder.Default
        private List<Map<String, Object>> commonSkillGaps = new ArrayList<>();

        // Target Company distribution
        @Builder.Default
        private List<Map<String, Object>> topTargetCompanies = new ArrayList<>();
    }
}
