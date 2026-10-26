package com.hiresense.modules.job.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobMatchDto {
    private Long jobId;
    private String jobTitle;
    private String company;
    private Integer overallMatchScore;
    private Integer skillsMatchScore;
    private Integer experienceMatchScore;
    private Integer educationMatchScore;
    private Integer locationMatchScore;
    private Integer roleMatchScore;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<String> matchReasons;
    private List<String> potentialGaps;
}
