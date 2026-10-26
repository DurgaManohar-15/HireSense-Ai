package com.hiresense.modules.intelligence.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
public class GenerateRoadmapRequest {

    @Min(value = 3, message = "Duration must be at least 3 days")
    @Max(value = 180, message = "Duration cannot exceed 180 days")
    @Builder.Default
    private Integer durationDays = 30;

    @Min(value = 1, message = "Hours per day must be at least 1")
    @Max(value = 12, message = "Hours per day cannot exceed 12")
    @Builder.Default
    private Integer hoursPerDay = 2;

    private String targetRole;
    private String targetCompany;

    // Custom Topics requested by user
    @Builder.Default
    private List<String> topics = new ArrayList<>();

    // Depth Level: 'BRIEF', 'IN_DEPTH', 'GENERAL_AWARENESS'
    @Builder.Default
    private String depthLevel = "IN_DEPTH";

    // Gap Skills forwarded from Skill Gap Analyzer
    @Builder.Default
    private List<String> customSkillGaps = new ArrayList<>();

    private String jobDescription;
}

