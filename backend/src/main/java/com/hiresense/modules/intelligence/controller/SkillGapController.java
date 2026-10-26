package com.hiresense.modules.intelligence.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.intelligence.dto.CompanyReadinessDto;
import com.hiresense.modules.intelligence.dto.SkillGapDto;
import com.hiresense.modules.intelligence.service.SkillGapAnalysisService;
import com.hiresense.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/skill-gaps")
@RequiredArgsConstructor
public class SkillGapController {

    private final SkillGapAnalysisService skillGapService;

    // 1. Get Current Student Skill Gaps & Evidence
    @GetMapping
    public ResponseEntity<ApiResponse<List<SkillGapDto>>> getSkillGaps(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<SkillGapDto> skillGaps = skillGapService.getSkillGaps(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(skillGaps));
    }

    // 2. Get Company-Specific Readiness & Skill Benchmark Gaps
    @GetMapping("/company/{companyId}")
    public ResponseEntity<ApiResponse<CompanyReadinessDto>> getCompanySkillGaps(
            @PathVariable Long companyId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        CompanyReadinessDto companyGaps = skillGapService.getCompanySkillGaps(userPrincipal.getId(), companyId);
        return ResponseEntity.ok(ApiResponse.success(companyGaps));
    }

    // 3. Dynamic Multi-Domain JD Skill Gap Comparative Calibration
    @PostMapping("/analyze-jd")
    public ResponseEntity<ApiResponse<com.hiresense.modules.intelligence.dto.JdSkillGapAnalysisResponse>> analyzeJdSkillGap(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @jakarta.validation.Valid @RequestBody com.hiresense.modules.intelligence.dto.JdSkillGapAnalysisRequest request) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : null;
        com.hiresense.modules.intelligence.dto.JdSkillGapAnalysisResponse response = skillGapService.analyzeJdSkillGaps(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 4. Retrieve Student Verified Evidence Skills for Auto-fill
    @GetMapping("/student-skills")
    public ResponseEntity<ApiResponse<List<String>>> getStudentSkills(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : null;
        List<String> skills = skillGapService.getStudentKnownSkills(userId);
        return ResponseEntity.ok(ApiResponse.success(skills));
    }
}
