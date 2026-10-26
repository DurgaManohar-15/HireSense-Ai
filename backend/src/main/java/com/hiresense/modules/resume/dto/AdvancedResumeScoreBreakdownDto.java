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
public class AdvancedResumeScoreBreakdownDto {

    private Integer overallScore; // 0-100 (Deterministic weighted sum)
    private Integer atsCompatibilityScore; // 0-100

    // Component Scores
    private ScoreCategoryDetailDto contentQuality; // 20%
    private ScoreCategoryDetailDto skillsRelevance; // 20%
    private ScoreCategoryDetailDto experienceAndProjects; // 20%
    private ScoreCategoryDetailDto keywordRelevance; // 15%
    private ScoreCategoryDetailDto structureAndReadability; // 15%
    private ScoreCategoryDetailDto atsCompatibility; // 10%

    // Optional Additional Rubric Dimension
    private ScoreCategoryDetailDto impactAndMetrics; // Impact scoring analysis

    @Builder.Default
    private List<String> keyStrengths = new ArrayList<>();

    @Builder.Default
    private List<String> keyGaps = new ArrayList<>();

    @Builder.Default
    private List<String> immediateActionPlan = new ArrayList<>();
}
