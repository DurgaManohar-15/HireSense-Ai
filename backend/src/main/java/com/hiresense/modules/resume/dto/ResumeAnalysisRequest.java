package com.hiresense.modules.resume.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeAnalysisRequest {
    private Long jobDescriptionId; // Optional reference to a saved JD
    private String jobDescription; // Optional Job Description (JD) text
    private String targetRole;
    private String targetCompany;
    private String mode; // 'STANDALONE' or 'JOB_DESCRIPTION'
}
