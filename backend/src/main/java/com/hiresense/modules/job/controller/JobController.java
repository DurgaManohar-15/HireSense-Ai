package com.hiresense.modules.job.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.job.dto.JobDto;
import com.hiresense.modules.job.dto.JobMatchDto;
import com.hiresense.modules.job.service.JobService;
import com.hiresense.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    // 1. Search and Filter Jobs
    @GetMapping
    public ResponseEntity<ApiResponse<List<JobDto>>> searchJobs(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String workType,
            @RequestParam(required = false) String experienceLevel,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long userId = (userPrincipal != null) ? userPrincipal.getId() : null;
        List<JobDto> jobs = jobService.searchJobs(userId, query, location, workType, experienceLevel);
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }

    // 2. Get Single Job Details
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobDto>> getJobById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long userId = (userPrincipal != null) ? userPrincipal.getId() : null;
        JobDto job = jobService.getJobById(id, userId);
        return ResponseEntity.ok(ApiResponse.success(job));
    }

    // 3. Toggle Save / Bookmark Job
    @PostMapping("/{id}/save")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleSaveJob(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        boolean saved = jobService.toggleSaveJob(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(
                saved ? "Job bookmarked successfully" : "Job removed from saved list",
                Map.of("jobId", id, "saved", saved)
        ));
    }

    // 4. Get Current User's Saved Jobs
    @GetMapping("/saved")
    public ResponseEntity<ApiResponse<List<JobDto>>> getSavedJobs(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<JobDto> savedJobs = jobService.getSavedJobs(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(savedJobs));
    }

    // 5. Calculate Comprehensive Transparent Match Breakdown
    @GetMapping("/{id}/match")
    public ResponseEntity<ApiResponse<JobMatchDto>> getMatchBreakdown(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        JobMatchDto match = jobService.calculateMatchBreakdown(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(match));
    }
}
