package com.hiresense.modules.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationAnalyticsDto {
    private long totalApplications;
    private long activeApplications;
    private long interviewCount;
    private long offerCount;
    private long rejectedCount;
    private double interviewConversionRate;
    private double offerConversionRate;
    private Map<String, Long> statusBreakdown;
}
