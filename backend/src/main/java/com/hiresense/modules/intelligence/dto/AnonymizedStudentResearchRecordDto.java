package com.hiresense.modules.intelligence.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnonymizedStudentResearchRecordDto {
    private String anonymizedId; // e.g. 'STUDENT_A8F2'
    private String scoringVersion;
    private Integer prsScore;
    private Integer confidenceScore;
    private Integer preAssessmentScore;
    private Integer postAssessmentScore;
    private Integer absoluteImprovement;
    private Double relativeImprovementPercent;
    private Double normalizedLearningGain;
    private int assessmentCount;
    private int resumeCount;
    private int interviewCount;
    private Instant calculatedAt;
}
