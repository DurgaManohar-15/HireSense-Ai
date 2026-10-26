package com.hiresense.modules.interview.dto;

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
public class TurnEvaluationDto {
    private Integer relevanceScore;
    private Integer technicalCorrectnessScore;
    private Integer completenessScore;
    private Integer clarityScore;
    private Integer communicationScore;
    private Integer overallTurnScore;

    @Builder.Default
    private List<String> strengths = new ArrayList<>();

    @Builder.Default
    private List<String> weaknesses = new ArrayList<>();

    @Builder.Default
    private List<String> improvementSuggestions = new ArrayList<>();

    private String suggestedFollowUpTopic;

    private String modelAnswer;

    private String practicalExample;

    @Builder.Default
    private List<String> keyTakeaways = new ArrayList<>();
}
