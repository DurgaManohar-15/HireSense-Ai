package com.hiresense.modules.assessment.dto;

import com.hiresense.modules.assessment.model.AssessmentCategory;
import com.hiresense.modules.assessment.model.AssessmentDifficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuestionRequest {

    @NotNull(message = "Category is required")
    private AssessmentCategory category;

    @NotBlank(message = "Topic is required")
    private String topic;

    @NotNull(message = "Difficulty is required")
    private AssessmentDifficulty difficulty;

    @NotBlank(message = "Question text is required")
    private String questionText;

    private String explanation;
    private String example;
    private String useCase;

    @Builder.Default
    private Integer marks = 1;

    @NotEmpty(message = "At least 2 options are required")
    private List<QuestionOptionDto> options;
}
