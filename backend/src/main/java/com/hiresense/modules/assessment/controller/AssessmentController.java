package com.hiresense.modules.assessment.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.assessment.dto.*;
import com.hiresense.modules.assessment.service.AssessmentService;
import com.hiresense.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;

    // 1. List Available Assessment Templates
    @GetMapping("/assessments")
    public ResponseEntity<ApiResponse<List<AssessmentDefinitionDto>>> getAvailableAssessments() {
        List<AssessmentDefinitionDto> assessments = assessmentService.getAllAvailableAssessments();
        return ResponseEntity.ok(ApiResponse.success(assessments));
    }

    // 2. Get Assessment Details / Rules
    @GetMapping("/assessments/{id}")
    public ResponseEntity<ApiResponse<AssessmentDefinitionDto>> getAssessmentById(@PathVariable Long id) {
        AssessmentDefinitionDto assessment = assessmentService.getAssessmentDefinitionById(id);
        return ResponseEntity.ok(ApiResponse.success(assessment));
    }

    // 2b. List Active Topics with Question Counts for Custom Assessment UI
    @GetMapping("/assessments/custom/topics")
    public ResponseEntity<ApiResponse<List<AssessmentTopicDto>>> getAvailableTopics() {
        List<AssessmentTopicDto> topics = assessmentService.getAvailableTopicsWithCounts();
        return ResponseEntity.ok(ApiResponse.success(topics));
    }

    // 2c. Check Question Availability before Starting Custom Assessment
    @PostMapping("/assessments/custom/availability")
    public ResponseEntity<ApiResponse<AssessmentAvailabilityDto>> checkAvailability(
            @RequestBody CustomAssessmentConfigRequest request) {
        AssessmentAvailabilityDto availability = assessmentService.checkQuestionAvailability(request);
        return ResponseEntity.ok(ApiResponse.success(availability));
    }

    // 3. Start a Timed Assessment Session (from standard template)
    @PostMapping("/assessments/{id}/start")
    public ResponseEntity<ApiResponse<AssessmentSessionDto>> startAssessment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        StartAssessmentRequest request = StartAssessmentRequest.builder()
                .assessmentDefinitionId(id)
                .build();
        AssessmentSessionDto session = assessmentService.startAssessmentSession(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Assessment session started successfully", session));
    }

    // 3b. Custom/Flexible Start Session with Multi-Topic Configuration
    @PostMapping("/assessments/custom/start")
    public ResponseEntity<ApiResponse<AssessmentSessionDto>> startCustomAssessment(
            @Valid @RequestBody CustomAssessmentConfigRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AssessmentSessionDto session = assessmentService.startCustomAssessmentSession(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Assessment session started successfully", session));
    }

    // 4. Retrieve Active Assessment Session (with safe question view)
    @GetMapping("/assessment-sessions/{sessionId}")
    public ResponseEntity<ApiResponse<AssessmentSessionDto>> getActiveSession(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AssessmentSessionDto session = assessmentService.getActiveSession(sessionId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(session));
    }

    // 5. Save an Answer / Toggle Mark for Review
    @PostMapping("/assessment-sessions/{sessionId}/responses")
    public ResponseEntity<ApiResponse<Void>> saveAnswer(
            @PathVariable Long sessionId,
            @Valid @RequestBody SaveAnswerRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        assessmentService.saveAnswer(sessionId, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Response saved successfully", null));
    }

    // 6. Submit and Evaluate Assessment
    @PostMapping("/assessment-sessions/{sessionId}/submit")
    public ResponseEntity<ApiResponse<AssessmentResultResponse>> submitAssessment(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AssessmentResultResponse result = assessmentService.submitAssessment(sessionId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Assessment evaluated and recorded", result));
    }

    // 7. Get Evaluated Result with Review
    @GetMapping("/assessment-results/{resultId}")
    public ResponseEntity<ApiResponse<AssessmentResultResponse>> getResult(
            @PathVariable Long resultId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AssessmentResultResponse result = assessmentService.getResultById(resultId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // 8. Historical Student Attempts
    @GetMapping("/students/me/assessment-history")
    public ResponseEntity<ApiResponse<List<AssessmentHistorySummaryDto>>> getMyAssessmentHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<AssessmentHistorySummaryDto> history = assessmentService.getStudentAssessmentHistory(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    // 9. Topic Performance Breakdown
    @GetMapping("/students/me/topic-performance")
    public ResponseEntity<ApiResponse<List<TopicPerformanceDto>>> getMyTopicPerformance(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<TopicPerformanceDto> performance = assessmentService.getAggregateStudentTopicPerformance(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(performance));
    }
}
