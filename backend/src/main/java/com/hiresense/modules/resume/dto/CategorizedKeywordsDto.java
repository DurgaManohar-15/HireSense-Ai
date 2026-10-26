package com.hiresense.modules.resume.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorizedKeywordsDto {

    @Builder.Default
    private List<KeywordItemDto> programmingLanguages = new ArrayList<>();

    @Builder.Default
    private List<KeywordItemDto> frameworksAndLibraries = new ArrayList<>();

    @Builder.Default
    private List<KeywordItemDto> databases = new ArrayList<>();

    @Builder.Default
    private List<KeywordItemDto> cloudAndDevOps = new ArrayList<>();

    @Builder.Default
    private List<KeywordItemDto> toolsAndMethodologies = new ArrayList<>();

    @Builder.Default
    private List<KeywordItemDto> softSkillsAndDomain = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KeywordItemDto {
        private String keyword;
        private String representation; // "STRONGLY_REPRESENTED", "WEAKLY_REPRESENTED", "MENTIONED_ONCE", "MISSING_FROM_RESUME"
        private Integer occurrenceCount;
        private boolean requiredByJd;
        private String contextSnippet;
    }
}
