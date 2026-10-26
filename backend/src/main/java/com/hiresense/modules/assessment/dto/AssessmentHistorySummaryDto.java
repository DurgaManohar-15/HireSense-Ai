package com.hiresense.modules.assessment.dto;

import com.hiresense.modules.assessment.model.AssessmentCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentHistorySummaryDto {
    private Long id;
    private Long sessionId;
    private String assessmentTitle;
    private AssessmentCategory category;
    private Integer totalQuestions;
    private Integer correctCount;
    private BigDecimal scorePercentage;
    private boolean passed;
    private Integer timeTakenSeconds;
    private Instant completedAt;
}
