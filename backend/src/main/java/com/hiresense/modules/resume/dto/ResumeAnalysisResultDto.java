package com.hiresense.modules.resume.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
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
public class ResumeAnalysisResultDto {

    @NotNull(message = "Overall score is required")
    @Min(value = 0, message = "Overall score cannot be negative")
    @Max(value = 100, message = "Overall score cannot exceed 100")
    private Integer overallScore; // Resume Quality Score (0-100)

    @NotNull(message = "ATS oriented score is required")
    @Min(value = 0, message = "ATS score cannot be negative")
    @Max(value = 100, message = "ATS score cannot exceed 100")
    private Integer atsOrientedScore; // ATS-Oriented Compatibility Score (0-100)

    private String targetRoleMatchSummary;

    // Rich Deterministic Score Breakdown
    private AdvancedResumeScoreBreakdownDto scoreBreakdown;

    // Categorized Keywords
    private CategorizedKeywordsDto categorizedKeywords;

    // Section-by-Section Review
    @Builder.Default
    private List<ResumeSectionReviewDto> sectionReviews = new ArrayList<>();

    // Multi-source Evidence-based Skill Matches
    @Builder.Default
    private List<SkillEvidenceDetailDto> skillEvidenceDetails = new ArrayList<>();

    // Section presence lists
    @Builder.Default
    private List<String> sectionsFound = new ArrayList<>();

    @Builder.Default
    private List<String> missingSections = new ArrayList<>();

    @Builder.Default
    private List<String> strengths = new ArrayList<>();

    @Builder.Default
    private List<String> weaknesses = new ArrayList<>();

    @Builder.Default
    private List<String> extractedSkills = new ArrayList<>();

    @Builder.Default
    private List<String> keywords = new ArrayList<>();

    @Builder.Default
    private List<String> recommendations = new ArrayList<>();

    // ATS Audit Specific Points
    @Builder.Default
    private List<String> atsAuditDetails = new ArrayList<>();

    // Contextual Questions (Clarifying, non-hallucinatory)
    @Builder.Default
    private List<String> contextualQuestions = new ArrayList<>();

    // Job Description (JD) specific fields
    private String mode; // 'STANDALONE' | 'JOB_DESCRIPTION'
    private Long jobDescriptionId;
    private String jobTitle;
    private String company;
    private Integer jdMatchScore;
    
    @Builder.Default
    private List<String> jdRequiredSkills = new ArrayList<>();

    @Builder.Default
    private List<String> jdMatchingSkills = new ArrayList<>();

    @Builder.Default
    private List<String> jdMissingSkills = new ArrayList<>();

    @Builder.Default
    private List<String> tailoredSuggestions = new ArrayList<>();

    @Builder.Default
    private List<String> learningPriorities = new ArrayList<>();
}
