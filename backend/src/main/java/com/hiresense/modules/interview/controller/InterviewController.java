package com.hiresense.modules.interview.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.interview.dto.*;
import com.hiresense.modules.interview.service.InterviewService;
import com.hiresense.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    // 1. Start or Initialize New AI Mock Interview Session
    @PostMapping
    public ResponseEntity<ApiResponse<InterviewSessionDto>> startInterview(
            @Valid @RequestBody StartInterviewRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        InterviewSessionDto session = interviewService.startInterview(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("AI Mock Interview session started successfully", session));
    }

    // 2. Get Student Interview History (Placed before /{id} to prevent path variable shadowing)
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<InterviewHistorySummaryDto>>> getMyInterviewHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<InterviewHistorySummaryDto> history = interviewService.getMyInterviewHistory(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    // 3. Get Current Interview Session State & Active Question
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InterviewSessionDto>> getInterviewSession(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        InterviewSessionDto session = interviewService.getInterviewSession(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(session));
    }

    // 4. Submit Turn Answer & Get Real-Time Evaluation / Next Question
    @PostMapping("/{id}/answers")
    public ResponseEntity<ApiResponse<SubmitAnswerResponse>> submitAnswer(
            @PathVariable Long id,
            @Valid @RequestBody SubmitAnswerRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        SubmitAnswerResponse response = interviewService.submitAnswer(id, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Answer evaluated successfully", response));
    }

    // 5. Retrieve Comprehensive Final Interview Performance Report
    @GetMapping("/{id}/report")
    public ResponseEntity<ApiResponse<InterviewFinalReportResponse>> getFinalReport(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        InterviewFinalReportResponse report = interviewService.getFinalReport(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(report));
    }
}
