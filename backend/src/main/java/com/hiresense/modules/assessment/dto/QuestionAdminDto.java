package com.hiresense.modules.assessment.dto;

import com.hiresense.modules.assessment.model.AssessmentCategory;
import com.hiresense.modules.assessment.model.AssessmentDifficulty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionAdminDto {
    private Long id;
    private AssessmentCategory category;
    private String topic;
    private AssessmentDifficulty difficulty;
    private String questionText;
    private String explanation;
    private String example;
    private String useCase;
    private Integer marks;
    private boolean active;
    private List<QuestionOptionDto> options;
    private Instant createdAt;
    private Instant updatedAt;
}
