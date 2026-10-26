package com.hiresense.modules.resume.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillEvidenceDetailDto {

    private String skillName;
    private String category; // e.g. "TECHNICAL", "FRAMEWORK", "DATABASE", "CLOUD"
    private boolean requiredByJd; // true = Required, false = Preferred / General
    private String requirementImportance; // "REQUIRED", "PREFERRED", "OPTIONAL", "INFERRED"

    // Evidence Sources Breakdown
    private boolean resumePresent;
    private String resumeEvidenceDetails; // e.g. "Mentioned 3 times across 2 projects"

    private boolean assessmentPresent;
    private Integer assessmentScore; // e.g. 84%

    private boolean interviewPresent;
    private Integer interviewScore; // e.g. 78%

    private boolean projectEvidencePresent;
    private String projectEvidenceDetails;

    private boolean certificationPresent;

    // Calibrated Levels & Gap
    private Integer currentObservedLevel; // 0-100 (deterministic multi-source calibration)
    private Integer requiredTargetLevel; // 0-100
    private Integer gapScore; // max(0, required - current)
    private String matchStatus; // "STRONG_MATCH", "PARTIAL_MATCH", "WEAK_MATCH", "NOT_DEMONSTRATED"
    private String priority; // "CRITICAL", "HIGH", "MEDIUM", "LOW"
    private String evidenceSummary;

    // Distinguishing Keyword Gap vs Real Skill Gap
    private boolean isResumeKeywordGap; // true if missing from resume text
    private boolean isActualSkillGap; // true if evidence is below required level

    // Actionable verified recommendation
    private String recommendationText;
    
    @Builder.Default
    private List<LearningResourceDto> recommendedResources = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LearningResourceDto {
        private String title;
        private String resourceType; // "OFFICIAL_DOCS", "TUTORIAL", "PRACTICE", "HIRESENSE_MODULE"
        private String url;
        private String estimatedTime;
        private boolean verified;
    }
}
