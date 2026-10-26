package com.hiresense.modules.application.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.application.dto.ApplicationAnalyticsDto;
import com.hiresense.modules.application.dto.JobApplicationDto;
import com.hiresense.modules.application.service.JobApplicationService;
import com.hiresense.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService applicationService;

    // 1. Get All User Applications
    @GetMapping
    public ResponseEntity<ApiResponse<List<JobApplicationDto>>> getMyApplications(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<JobApplicationDto> list = applicationService.getMyApplications(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    // 2. Get Application Analytics & Conversion Rates
    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<ApplicationAnalyticsDto>> getAnalytics(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ApplicationAnalyticsDto analytics = applicationService.getAnalytics(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    // 3. Get Single Application Details & History
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobApplicationDto>> getApplicationById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        JobApplicationDto app = applicationService.getApplicationById(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(app));
    }

    // 4. Create New Job Application
    @PostMapping
    public ResponseEntity<ApiResponse<JobApplicationDto>> createApplication(
            @RequestBody JobApplicationDto request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        JobApplicationDto created = applicationService.createApplication(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Application created successfully", created));
    }

    // 5. Update Application Stage / Status (Kanban drag-and-drop or dropdown)
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<JobApplicationDto>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String newStatus = body.get("status");
        String notes = body.get("notes");
        JobApplicationDto updated = applicationService.updateStatus(id, userPrincipal.getId(), newStatus, notes);
        return ResponseEntity.ok(ApiResponse.success("Application stage updated successfully", updated));
    }

    // 6. Update Application Full Details
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<JobApplicationDto>> updateApplication(
            @PathVariable Long id,
            @RequestBody JobApplicationDto request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        JobApplicationDto updated = applicationService.updateApplication(id, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Application updated successfully", updated));
    }

    // 7. Delete Application
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteApplication(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        applicationService.deleteApplication(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Application deleted successfully", null));
    }
}
