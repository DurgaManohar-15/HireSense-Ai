package com.hiresense.modules.resume.dto;

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
public class AnalysisComparisonDto {

    // Snapshot A
    private Long analysisAId;
    private Integer resumeVersionA;
    private String jdTitleA;
    private Integer resumeScoreA;
    private Integer atsScoreA;
    private Integer jdMatchScoreA;
    private Integer skillGapsCountA;
    private Instant createdAtA;

    // Snapshot B
    private Long analysisBId;
    private Integer resumeVersionB;
    private String jdTitleB;
    private Integer resumeScoreB;
    private Integer atsScoreB;
    private Integer jdMatchScoreB;
    private Integer skillGapsCountB;
    private Instant createdAtB;

    // Deltas (B - A)
    private Integer resumeScoreDelta;
    private Integer atsScoreDelta;
    private Integer jdMatchScoreDelta;
    private Integer skillGapsDelta; // Negative indicates reduction in gaps

    @Builder.Default
    private List<SkillDeltaItemDto> skillDeltas = new ArrayList<>();

    @Builder.Default
    private List<String> keyImprovements = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillDeltaItemDto {
        private String skillName;
        private Integer levelBefore;
        private Integer levelAfter;
        private Integer gapBefore;
        private Integer gapAfter;
        private String statusBefore;
        private String statusAfter;
    }
}
