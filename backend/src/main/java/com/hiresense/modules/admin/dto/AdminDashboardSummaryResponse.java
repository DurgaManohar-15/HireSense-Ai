package com.hiresense.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardSummaryResponse {
    private long totalStudents;
    private long totalProfilesCompleted;
    private long totalTargetCompanies;
    private double systemHealthPercentage;
    private String version;
}
