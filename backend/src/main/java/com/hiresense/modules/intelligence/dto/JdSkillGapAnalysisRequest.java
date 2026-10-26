package com.hiresense.modules.intelligence.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JdSkillGapAnalysisRequest {

    /**
     * Candidate's known skills or competencies (comma, semicolon, or newline separated).
     * If blank, existing student profile/resume skills will be used as a baseline.
     */
    private String knownSkills;

    /**
     * Target Job Description (JD) text containing responsibilities, requirements, and qualifications.
     */
    @NotBlank(message = "Job description text is required for skill gap analysis")
    private String jobDescriptionText;

    /**
     * Optional target role override (e.g. "Business Development Associate", "Java Backend Developer").
     */
    private String targetRole;

    /**
     * Optional target company override (e.g. "GradGenious Edutech", "Amazon").
     */
    private String targetCompany;
}
