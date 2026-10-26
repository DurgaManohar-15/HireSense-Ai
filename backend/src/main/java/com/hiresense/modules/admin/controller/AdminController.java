package com.hiresense.modules.admin.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.admin.dto.AdminDashboardSummaryResponse;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.profile.repository.StudentProfileRepository;
import com.hiresense.modules.profile.repository.TargetCompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final StudentProfileRepository profileRepository;
    private final TargetCompanyRepository targetCompanyRepository;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AdminDashboardSummaryResponse>> getAdminSummary() {
        long totalUsers = userRepository.count();
        long totalProfiles = profileRepository.count();
        long totalCompanies = targetCompanyRepository.count();

        AdminDashboardSummaryResponse summary = AdminDashboardSummaryResponse.builder()
                .totalStudents(totalUsers)
                .totalProfilesCompleted(totalProfiles)
                .totalTargetCompanies(totalCompanies)
                .systemHealthPercentage(100.0)
                .version("1.0.0-Phase1")
                .build();

        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
