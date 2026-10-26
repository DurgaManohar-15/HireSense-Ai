package com.hiresense.modules.intelligence.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResearchCohortMetricsDto {
    private long totalStudents;
    private double averagePrs;
    private double averageConfidence;
    private double averagePreScore;
    private double averagePostScore;
    private double averageAbsoluteGain;
    private double averageRelativeGainPercentage;
    private double averageNormalizedGain;
    private double cohensD;
    private long totalAssessmentsCompleted;
    private long totalResumesAnalyzed;
    private long totalInterviewsCompleted;
}
