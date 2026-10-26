package com.hiresense.modules.assessment.dto;

import com.hiresense.modules.assessment.model.AssessmentDifficulty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentAvailabilityDto {
    private List<String> requestedTopics;
    private AssessmentDifficulty requestedDifficulty;
    private int requestedCount;
    private int availableCount;
    private boolean sufficient;
    private String message;

    @Builder.Default
    private Map<String, Integer> topicBreakdown = new HashMap<>();

    @Builder.Default
    private Map<String, Integer> difficultyBreakdown = new HashMap<>();
}
