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
public class InterviewFinalReportDto {
    private Integer overallScore;
    private Integer technicalScore;
    private Integer behavioralScore;
    private Integer communicationScore;
    private String summaryEvaluation;

    @Builder.Default
    private List<String> keyStrengths = new ArrayList<>();

    @Builder.Default
    private List<String> keyWeaknesses = new ArrayList<>();

    @Builder.Default
    private List<String> topicsToImprove = new ArrayList<>();

    @Builder.Default
    private List<String> actionableRoadmapSuggestions = new ArrayList<>();
}
