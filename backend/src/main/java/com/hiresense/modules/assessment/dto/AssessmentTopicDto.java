package com.hiresense.modules.assessment.dto;

import com.hiresense.modules.assessment.model.AssessmentCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentTopicDto {
    private String topic;
    private AssessmentCategory category;
    private int totalAvailableQuestions;

    @Builder.Default
    private Map<String, Integer> difficultyCounts = new HashMap<>();
}
