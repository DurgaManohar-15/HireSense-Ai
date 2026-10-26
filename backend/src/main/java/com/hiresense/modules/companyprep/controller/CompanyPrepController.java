package com.hiresense.modules.companyprep.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.companyprep.dto.CompanyPrepDto;
import com.hiresense.modules.companyprep.service.CompanyPrepService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/company-prep")
@RequiredArgsConstructor
public class CompanyPrepController {

    private final CompanyPrepService companyPrepService;

    // 1. List All Company Prep Guides
    @GetMapping
    public ResponseEntity<ApiResponse<List<CompanyPrepDto>>> getAllGuides() {
        return ResponseEntity.ok(ApiResponse.success(companyPrepService.getAllCompanyGuides()));
    }

    // 2. Get Single Company Prep Guide
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyPrepDto>> getGuideById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(companyPrepService.getCompanyGuideById(id)));
    }
}
