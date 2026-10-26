package com.hiresense.modules.assessment.dto;

import com.hiresense.modules.assessment.model.AssessmentCategory;
import com.hiresense.modules.assessment.model.AssessmentDifficulty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
public class CustomAssessmentConfigRequest {
    @Builder.Default
    private List<String> topics = new ArrayList<>();

    private AssessmentCategory category;

    @Builder.Default
    private AssessmentDifficulty difficulty = AssessmentDifficulty.MEDIUM; // EASY, MEDIUM, HARD, MIXED

    @Min(value = 1, message = "Question count must be at least 1")
    @Max(value = 50, message = "Question count cannot exceed 50")
    @Builder.Default
    private Integer questionCount = 15;

    @Min(value = 5, message = "Duration must be at least 5 minutes")
    @Max(value = 120, message = "Duration cannot exceed 120 minutes")
    private Integer durationMinutes;

    private String targetRole;
    private String targetCompany;
    private boolean autoAdjustIfInsufficient;
}
