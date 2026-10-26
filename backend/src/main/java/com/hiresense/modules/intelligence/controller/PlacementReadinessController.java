package com.hiresense.modules.intelligence.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.intelligence.dto.PlacementReadinessDto;
import com.hiresense.modules.intelligence.service.PlacementReadinessCalculatorService;
import com.hiresense.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/readiness")
@RequiredArgsConstructor
public class PlacementReadinessController {

    private final PlacementReadinessCalculatorService readinessService;

    // 1. Get Latest Placement Readiness Score (PRS) & Breakdown
    @GetMapping
    public ResponseEntity<ApiResponse<PlacementReadinessDto>> getLatestReadiness(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        PlacementReadinessDto dto = readinessService.getLatestReadiness(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    // 2. Trigger Explicit Recalculation & Persist New Snapshot
    @PostMapping("/recalculate")
    public ResponseEntity<ApiResponse<PlacementReadinessDto>> recalculateReadiness(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        PlacementReadinessDto dto = readinessService.calculateAndPersistReadiness(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Readiness score recalculated successfully", dto));
    }

    // 3. Get Longitudinal Readiness Snapshot History
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<PlacementReadinessDto>>> getReadinessHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<PlacementReadinessDto> history = readinessService.getReadinessHistory(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}
