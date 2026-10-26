package com.hiresense.modules.resume.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JdResumeAnalysisResponse {

    private Long id;
    private Long userId;
    private Long resumeId;
    private Integer resumeVersionNumber;
    private Long jobDescriptionId;
    private String jobTitle;
    private String company;
    private Long resumeAnalysisId;

    // Scores
    private Integer resumeScore; // 0-100 (Resume Quality Score)
    private Integer atsScore; // 0-100 (ATS-Oriented Compatibility)
    private Integer jdMatchScore; // 0-100 (Job Match Score)

    // Match Counts
    private Integer strongMatchesCount;
    private Integer partialMatchesCount;
    private Integer weakMatchesCount;
    private Integer missingMatchesCount;

    // Detailed Skill Analysis & Evidence
    @Builder.Default
    private List<SkillEvidenceDetailDto> allSkillsAnalysis = new ArrayList<>();

    @Builder.Default
    private List<SkillEvidenceDetailDto> strongSkills = new ArrayList<>();

    @Builder.Default
    private List<SkillEvidenceDetailDto> prioritySkillGaps = new ArrayList<>();

    @Builder.Default
    private List<SkillEvidenceDetailDto> keywordGaps = new ArrayList<>();

    // Tailored Suggestions & Contextual Questions
    @Builder.Default
    private List<ResumeSectionReviewDto> sectionReviews = new ArrayList<>();

    @Builder.Default
    private List<String> tailoredBulletSuggestions = new ArrayList<>();

    @Builder.Default
    private List<String> nextLearningPriorities = new ArrayList<>();

    private Instant createdAt;
}
