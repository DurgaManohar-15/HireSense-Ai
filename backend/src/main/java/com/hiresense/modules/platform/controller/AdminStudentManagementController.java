package com.hiresense.modules.platform.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.platform.dto.admin.AdminStudentDtos.*;
import com.hiresense.modules.platform.service.AdminStudentManagementService;
import com.hiresense.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/students")
@RequiredArgsConstructor
public class AdminStudentManagementController {

    private final AdminStudentManagementService studentManagementService;

    // 1. Search and Filter Students (Admin / Placement Officer)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PLACEMENT_OFFICER')")
    public ResponseEntity<ApiResponse<Page<StudentSummary>>> searchStudents(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String targetRole,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String band,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<StudentSummary> page = studentManagementService.searchStudents(query, targetRole, company, band, pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    // 2. Get Student Detail Overview (Admin / Placement Officer)
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLACEMENT_OFFICER')")
    public ResponseEntity<ApiResponse<StudentDetail>> getStudentDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        StudentDetail detail = studentManagementService.getStudentDetail(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    // 3. Get Cohort Placement Analytics (Admin / Placement Officer)
    @GetMapping("/cohort-analytics")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLACEMENT_OFFICER')")
    public ResponseEntity<ApiResponse<CohortAnalytics>> getCohortAnalytics() {
        CohortAnalytics analytics = studentManagementService.getCohortAnalytics();
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }
}
