package com.hiresense.modules.coding.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.coding.dto.*;
import com.hiresense.modules.coding.service.CodingService;
import com.hiresense.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/coding")
@RequiredArgsConstructor
public class CodingController {

    private final CodingService codingService;

    // 1. Get Problem Bank
    @GetMapping("/problems")
    public ResponseEntity<ApiResponse<List<CodingProblemDto>>> getAllProblems(
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String role,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long userId = (userPrincipal != null) ? userPrincipal.getId() : null;
        List<CodingProblemDto> problems = codingService.getAllProblems(userId, difficulty, topic, role);
        return ResponseEntity.ok(ApiResponse.success(problems));
    }

    // 1b. Get Role-based Practice Questions (Coding & MCQs with Placement Frequency)
    @GetMapping("/role-questions")
    public ResponseEntity<ApiResponse<List<RolePracticeQuestionDto>>> getRolePracticeQuestions(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String difficulty,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long userId = (userPrincipal != null) ? userPrincipal.getId() : null;
        List<RolePracticeQuestionDto> questions = codingService.getRolePracticeQuestions(userId, role, type, difficulty);
        return ResponseEntity.ok(ApiResponse.success(questions));
    }

    // 2. Get Single Problem Details
    @GetMapping("/problems/{id}")
    public ResponseEntity<ApiResponse<CodingProblemDto>> getProblemById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long userId = (userPrincipal != null) ? userPrincipal.getId() : null;
        CodingProblemDto problem = codingService.getProblemById(id, userId);
        return ResponseEntity.ok(ApiResponse.success(problem));
    }

    // 3. Run Code (Dry Run / Test Cases)
    @PostMapping("/problems/{id}/run")
    public ResponseEntity<ApiResponse<CodingRunResponse>> runCode(
            @PathVariable Long id,
            @RequestBody CodingRunRequest request) {
        CodingRunResponse response = codingService.runCode(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 4. Submit Code
    @PostMapping("/problems/{id}/submit")
    public ResponseEntity<ApiResponse<CodingRunResponse>> submitCode(
            @PathVariable Long id,
            @RequestBody CodingRunRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        CodingRunResponse response = codingService.submitCode(id, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Submission evaluated successfully", response));
    }

    // 5. Get User Coding Statistics
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<CodingStatsDto>> getCodingStats(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        CodingStatsDto stats = codingService.getCodingStats(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
