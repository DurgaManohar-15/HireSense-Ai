package com.hiresense.modules.coding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RolePracticeQuestionDto {
    private Long id;
    private String type; // "CODING" or "MCQ"
    private String title;
    private String topic;
    private String category;
    private String difficulty; // EASY, MEDIUM, HARD
    private List<String> roleTags;
    private List<String> companyTags;
    private String frequencyTag; // "🔥 Asked in 90% of Top Tech Placements"
    private Integer frequencyScore; // 95
    private String summary;

    // For Coding Problems
    private String slug;
    private boolean solved;

    // For MCQ Questions
    private String questionText;
    private List<McqOptionDto> options;
    private String explanation;
    private String example;
    private String useCase;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class McqOptionDto {
        private String label; // A, B, C, D
        private String text;
        private boolean correct;
    }
}
