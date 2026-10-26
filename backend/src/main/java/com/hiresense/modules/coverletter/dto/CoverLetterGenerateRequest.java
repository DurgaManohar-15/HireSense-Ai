package com.hiresense.modules.coverletter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoverLetterGenerateRequest {
    private Long jobId;
    private String companyName;
    private String roleTitle;
    private String jobDescription;
    private String tone; // PROFESSIONAL, CONVERSATIONAL, IMPACT_DRIVEN
    private String additionalInstructions;
    private Long resumeId;
    private String resumeText;
}
