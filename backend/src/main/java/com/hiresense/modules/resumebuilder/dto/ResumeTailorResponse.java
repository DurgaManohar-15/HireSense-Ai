package com.hiresense.modules.resumebuilder.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeTailorResponse {
    private Long resumeVersionId;
    private Integer beforeMatchScore;
    private Integer afterMatchScore;
    private String targetRole;
    private String targetCompany;
    private List<TailorSuggestionItem> suggestions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TailorSuggestionItem {
        private String id;
        private String section; // SUMMARY, EXPERIENCE, PROJECTS, SKILLS
        private String originalContent;
        private String suggestedContent;
        private String reason;
        private String matchedRequirement;
        private String actionType; // MODIFY, ADD, HIGHLIGHT
        private String status; // PENDING, ACCEPTED, REJECTED
    }
}
