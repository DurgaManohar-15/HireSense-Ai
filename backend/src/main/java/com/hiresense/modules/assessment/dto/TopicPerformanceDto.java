package com.hiresense.modules.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicPerformanceDto {
    private String topic;
    private String category;
    private Integer totalQuestions;
    private Integer correctCount;
    private BigDecimal scorePercentage;
}
