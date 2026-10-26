package com.hiresense.modules.assistant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class CareerAssistantDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssessmentRecommendationDto {
        @Builder.Default
        private List<String> topics = new ArrayList<>();
        private String category;
        private String difficulty; // EASY, MEDIUM, HARD, MIXED
        private Integer questionCount;
        private Integer durationMinutes;
        private String rationale;
        private String targetRole;
        private String targetCompany;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatRequest {
        private Long conversationId;

        @NotBlank(message = "Message cannot be empty")
        @Size(max = 1000, message = "Message cannot exceed 1000 characters")
        private String message;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatResponse {
        private Long conversationId;
        private String assistantReply;

        @Builder.Default
        private List<String> evidenceSources = new ArrayList<>();

        @Builder.Default
        private List<String> actionSuggestions = new ArrayList<>();

        private AssessmentRecommendationDto assessmentRecommendation;
        private String aiProvider;
        private Instant timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageDto {
        private Long id;
        private String senderType; // 'USER', 'ASSISTANT'
        private String messageText;
        private List<String> evidenceSources;
        private List<String> actionSuggestions;
        private AssessmentRecommendationDto assessmentRecommendation;
        private Instant createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConversationDto {
        private Long id;
        private String title;
        private String targetRole;
        private String targetCompany;
        private String aiProvider;

        @Builder.Default
        private List<MessageDto> messages = new ArrayList<>();

        private Instant createdAt;
        private Instant updatedAt;
    }
}
