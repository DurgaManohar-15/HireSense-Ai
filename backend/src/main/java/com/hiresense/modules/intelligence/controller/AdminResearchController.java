package com.hiresense.modules.intelligence.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.intelligence.dto.AnonymizedStudentResearchRecordDto;
import com.hiresense.modules.intelligence.dto.ResearchCohortMetricsDto;
import com.hiresense.modules.intelligence.service.ResearchAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/research")
@RequiredArgsConstructor
public class AdminResearchController {

    private final ResearchAnalyticsService researchService;

    // 1. Get Aggregated Cohort Statistical Metrics (Pre/Post gains, Cohen's d)
    @GetMapping("/cohort-metrics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResearchCohortMetricsDto>> getCohortResearchMetrics() {
        ResearchCohortMetricsDto metrics = researchService.getCohortResearchMetrics();
        return ResponseEntity.ok(ApiResponse.success(metrics));
    }

    // 2. Get Anonymized Individual Student Research Records
    @GetMapping("/records")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AnonymizedStudentResearchRecordDto>>> getAnonymizedRecords() {
        List<AnonymizedStudentResearchRecordDto> records = researchService.getAnonymizedResearchRecords();
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    // 3. Export Anonymized Research CSV
    @GetMapping(value = "/export-csv", produces = "text/csv")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> exportResearchCsv() {
        String csv = researchService.exportAnonymizedResearchCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"hiresense_research_data_anonymized.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}
