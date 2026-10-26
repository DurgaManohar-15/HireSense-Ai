package com.hiresense.modules.coding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodingStatsDto {
    private long totalProblems;
    private long solvedProblems;
    private long easySolved;
    private long mediumSolved;
    private long hardSolved;
    private double overallAccuracy;
    private Map<String, Long> topicBreakdown;
}
