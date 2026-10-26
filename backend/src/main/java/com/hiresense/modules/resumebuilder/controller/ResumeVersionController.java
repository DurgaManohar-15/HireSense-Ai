package com.hiresense.modules.resumebuilder.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.resumebuilder.dto.*;
import com.hiresense.modules.resumebuilder.service.ResumeVersionService;
import com.hiresense.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resume-versions")
@RequiredArgsConstructor
public class ResumeVersionController {

    private final ResumeVersionService resumeVersionService;

    // 1. Get All Resume Versions for Current User
    @GetMapping
    public ResponseEntity<ApiResponse<List<ResumeVersionDto>>> getMyResumeVersions(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<ResumeVersionDto> versions = resumeVersionService.getMyResumeVersions(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(versions));
    }

    // 2. Get Single Resume Version
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResumeVersionDto>> getResumeVersionById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ResumeVersionDto version = resumeVersionService.getResumeVersionById(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(version));
    }

    // 3. Create New Resume Version
    @PostMapping
    public ResponseEntity<ApiResponse<ResumeVersionDto>> createResumeVersion(
            @RequestBody ResumeVersionDto request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ResumeVersionDto created = resumeVersionService.createResumeVersion(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resume version created successfully", created));
    }

    // 4. Update Resume Version (Live Auto-Save / Save Button)
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ResumeVersionDto>> updateResumeVersion(
            @PathVariable Long id,
            @RequestBody ResumeVersionDto request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ResumeVersionDto updated = resumeVersionService.updateResumeVersion(id, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Resume version updated successfully", updated));
    }

    // 5. Delete Resume Version
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteResumeVersion(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        resumeVersionService.deleteResumeVersion(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Resume version deleted successfully", null));
    }

    // 6. Chat with HireSense AI Resume Agent
    @PostMapping("/ai-agent")
    public ResponseEntity<ApiResponse<ResumeAgentChatResponse>> chatWithResumeAgent(
            @RequestBody ResumeAgentChatRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ResumeAgentChatResponse response = resumeVersionService.chatWithAgent(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 7. Generate Job-Specific Resume Tailoring Suggestions
    @PostMapping("/tailor")
    public ResponseEntity<ApiResponse<ResumeTailorResponse>> tailorResume(
            @RequestBody ResumeTailorRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ResumeTailorResponse response = resumeVersionService.tailorResume(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
