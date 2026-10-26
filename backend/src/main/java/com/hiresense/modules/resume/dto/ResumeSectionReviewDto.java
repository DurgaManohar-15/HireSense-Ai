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
public class ResumeSectionReviewDto {

    private String sectionName; // e.g. "Professional Summary", "Education", "Projects", "Skills", "Experience", "Certifications"
    private String status; // "GOOD", "NEEDS_IMPROVEMENT", "MISSING"
    private Integer sectionScore; // 0-100
    private String extractedContent;
    
    @Builder.Default
    private List<String> positiveObservations = new ArrayList<>();

    @Builder.Default
    private List<String> issuesFound = new ArrayList<>();

    private String suggestedImprovement;
    private String contextualClarifyingQuestion; // e.g. "Have you used Docker in any personal/academic project?"
    private Long suggestionId; // If persisted as a ResumeImprovementSuggestion entity
    private String suggestionStatus; // "PENDING", "ACCEPTED", "EDITED", "REJECTED"
}
