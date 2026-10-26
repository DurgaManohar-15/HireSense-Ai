package com.hiresense.modules.assessment.dto;

import com.hiresense.modules.assessment.model.AssessmentDifficulty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DifficultyPerformanceDto {
    private AssessmentDifficulty difficulty;
    private Integer totalQuestions;
    private Integer correctCount;
    private BigDecimal scorePercentage;
}
