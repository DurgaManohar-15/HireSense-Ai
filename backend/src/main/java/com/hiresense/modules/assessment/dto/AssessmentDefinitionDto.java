package com.hiresense.modules.assessment.dto;

import com.hiresense.modules.assessment.model.AssessmentCategory;
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
public class AssessmentDefinitionDto {
    private Long id;
    private String title;
    private String slug;
    private String description;
    private AssessmentCategory category;
    private AssessmentDifficulty difficulty;
    private Integer durationMinutes;
    private Integer totalQuestions;
    private BigDecimal passingPercentage;
    private boolean active;
}
