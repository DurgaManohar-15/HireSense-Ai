package com.hiresense.modules.intelligence.dto;

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
public class JdSkillGapAnalysisResponse {

    private int matchScore; // 0 - 100 genuine calculated match percentage

    private String targetRole; // e.g. "Business Development Associate"

    private String targetCompany; // e.g. "GradGenious Edutech Private Limited"

    private String targetDomain; // e.g. "Sales & Marketing / EdTech"

    private String candidateDomain; // e.g. "Software Engineering / Web Development"

    private boolean hasDomainMismatch; // True if candidate background sharply diverges from JD domain

    private String domainDifferenceSummary; // Factual narrative explaining the exact difference

    @Builder.Default
    private List<String> requiredSkills = new ArrayList<>(); // Skills demanded by the JD

    @Builder.Default
    private List<String> matchedSkills = new ArrayList<>(); // Matching or transferable skills

    @Builder.Default
    private List<String> gapSkills = new ArrayList<>(); // Actual missing competencies

    @Builder.Default
    private List<String> surplusSkills = new ArrayList<>(); // Candidate skills not asked by this JD

    @Builder.Default
    private List<SkillComparisonItem> skillComparisons = new ArrayList<>();

    @Builder.Default
    private List<String> actionableAdvice = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillComparisonItem {
        private String skillName;
        private String category; // FUNCTIONAL, TECHNICAL, DOMAIN, SOFT_SKILL
        private boolean requiredByJd;
        private boolean possessedByCandidate;
        private String status; // MATCH, GAP, SURPLUS
        private String importance; // CRITICAL, IMPORTANT, BENEFICIAL
        private String explanation;
    }
}
