package com.hiresense.modules.intelligence.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.intelligence.dto.GenerateRoadmapRequest;
import com.hiresense.modules.intelligence.dto.RoadmapDto;
import com.hiresense.modules.intelligence.dto.RoadmapTaskDto;
import com.hiresense.modules.intelligence.service.RoadmapService;
import com.hiresense.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/roadmaps")
@RequiredArgsConstructor
public class RoadmapController {

    private final RoadmapService roadmapService;

    // 1. Generate Personalized Adaptive Preparation Roadmap
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<RoadmapDto>> generateRoadmap(
            @Valid @RequestBody GenerateRoadmapRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        RoadmapDto roadmap = roadmapService.generateRoadmap(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Personalized preparation roadmap generated successfully", roadmap));
    }

    // 2. Get Current Active Roadmap
    @GetMapping("/current")
    public ResponseEntity<ApiResponse<RoadmapDto>> getCurrentRoadmap(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        RoadmapDto roadmap = roadmapService.getCurrentRoadmap(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(roadmap));
    }

    // 3. Get Roadmap Version History
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<RoadmapDto>>> getRoadmapHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<RoadmapDto> history = roadmapService.getRoadmapHistory(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    // 4. Update Task Completion or Skipped Status
    @PutMapping("/tasks/{taskId}/status")
    public ResponseEntity<ApiResponse<RoadmapTaskDto>> updateTaskStatus(
            @PathVariable Long taskId,
            @RequestParam(defaultValue = "false") boolean completed,
            @RequestParam(defaultValue = "false") boolean skipped,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        RoadmapTaskDto updatedTask = roadmapService.updateTaskStatus(taskId, userPrincipal.getId(), completed, skipped);
        return ResponseEntity.ok(ApiResponse.success("Task status updated successfully", updatedTask));
    }
}
