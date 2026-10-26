package com.hiresense.modules.assistant.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.assistant.dto.CareerAssistantDtos.*;
import com.hiresense.modules.assistant.service.CareerAssistantService;
import com.hiresense.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/career-assistant")
@RequiredArgsConstructor
public class CareerAssistantController {

    private final CareerAssistantService assistantService;

    // 1. Send Message to AI Career Assistant & Receive Contextual Guidance
    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<ChatResponse>> sendCareerChat(
            @Valid @RequestBody ChatRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ChatResponse response = assistantService.processUserMessage(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 2. Get Current or Latest Career Conversation Thread
    @GetMapping("/conversation")
    public ResponseEntity<ApiResponse<ConversationDto>> getLatestConversation(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ConversationDto conversation = assistantService.getLatestOrCreateConversation(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(conversation));
    }

    // 3. Get Specific Conversation Thread
    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<ApiResponse<ConversationDto>> getConversation(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ConversationDto conversation = assistantService.getConversation(conversationId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(conversation));
    }
}
