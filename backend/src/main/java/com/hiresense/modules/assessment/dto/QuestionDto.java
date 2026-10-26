package com.hiresense.modules.assessment.dto;

import com.hiresense.modules.assessment.model.AssessmentCategory;
import com.hiresense.modules.assessment.model.AssessmentDifficulty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDto {
    private Long id;
    private Integer questionOrder;
    private AssessmentCategory category;
    private String topic;
    private AssessmentDifficulty difficulty;
    private String questionText;
    private Integer marks;
    private List<QuestionOptionDto> options;
    private Long selectedOptionId;
    private boolean markedForReview;
}
