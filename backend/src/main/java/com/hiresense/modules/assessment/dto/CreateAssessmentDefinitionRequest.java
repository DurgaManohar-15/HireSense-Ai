package com.hiresense.modules.assessment.dto;

import com.hiresense.modules.assessment.model.AssessmentCategory;
import com.hiresense.modules.assessment.model.AssessmentDifficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAssessmentDefinitionRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Slug is required")
    private String slug;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private AssessmentCategory category;

    @NotNull(message = "Difficulty is required")
    private AssessmentDifficulty difficulty;

    @NotNull(message = "Duration in minutes is required")
    private Integer durationMinutes;

    @NotNull(message = "Total questions count is required")
    private Integer totalQuestions;

    @NotNull(message = "Passing percentage is required")
    private BigDecimal passingPercentage;
}
