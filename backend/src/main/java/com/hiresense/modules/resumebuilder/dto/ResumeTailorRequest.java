package com.hiresense.modules.resumebuilder.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeTailorRequest {
    private Long resumeVersionId;
    private Long targetJobId;
    private String jobDescriptionText;
    private String targetCompany;
    private String targetRole;
}
