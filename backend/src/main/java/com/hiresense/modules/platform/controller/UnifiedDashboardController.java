package com.hiresense.modules.platform.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.platform.dto.UnifiedStudentDashboardDto;
import com.hiresense.modules.platform.service.UnifiedStudentDashboardService;
import com.hiresense.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class UnifiedDashboardController {

    private final UnifiedStudentDashboardService dashboardService;

    // 1. Get Aggregated Unified Student Dashboard Data
    @GetMapping("/student")
    public ResponseEntity<ApiResponse<UnifiedStudentDashboardDto>> getStudentDashboard(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        UnifiedStudentDashboardDto dto = dashboardService.getUnifiedDashboard(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(dto));
    }
}
