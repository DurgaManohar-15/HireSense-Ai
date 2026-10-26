package com.hiresense.modules.assessment.dto;

import com.hiresense.modules.assessment.model.AssessmentCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartAssessmentRequest {
    private Long assessmentDefinitionId;
    private AssessmentCategory category; // optional override
    private Integer questionCount; // optional override
}
