package com.hiresense.modules.platform.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.platform.dto.AuditLogDto;
import com.hiresense.modules.platform.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/audit-logs")
@RequiredArgsConstructor
public class AdminAuditLogController {

    private final AuditLogService auditLogService;

    // 1. Get Administrative Audit Logs (Admin Only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AuditLogDto>>> getAuditLogs(
            @PageableDefault(size = 30) Pageable pageable) {
        Page<AuditLogDto> page = auditLogService.getAuditLogs(pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }
}
