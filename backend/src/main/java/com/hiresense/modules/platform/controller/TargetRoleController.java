package com.hiresense.modules.platform.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.platform.dto.TargetRoleDto;
import com.hiresense.modules.platform.service.TargetRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/target-roles")
@RequiredArgsConstructor
public class TargetRoleController {

    private final TargetRoleService targetRoleService;

    // 1. Get List of Active Preparation Target Roles
    @GetMapping
    public ResponseEntity<ApiResponse<List<TargetRoleDto>>> getActiveRoles() {
        List<TargetRoleDto> roles = targetRoleService.getActiveRoles();
        return ResponseEntity.ok(ApiResponse.success(roles));
    }
}
