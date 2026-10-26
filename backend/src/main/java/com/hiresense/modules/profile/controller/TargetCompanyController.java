package com.hiresense.modules.profile.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.profile.dto.TargetCompanyResponse;
import com.hiresense.modules.profile.service.TargetCompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/target-companies")
@RequiredArgsConstructor
public class TargetCompanyController {

    private final TargetCompanyService targetCompanyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TargetCompanyResponse>>> getAllActiveCompanies() {
        List<TargetCompanyResponse> companies = targetCompanyService.getAllActiveCompanies();
        return ResponseEntity.ok(ApiResponse.success(companies));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TargetCompanyResponse>> getCompanyById(@PathVariable Long id) {
        TargetCompanyResponse company = targetCompanyService.getCompanyById(id);
        return ResponseEntity.ok(ApiResponse.success(company));
    }
}
