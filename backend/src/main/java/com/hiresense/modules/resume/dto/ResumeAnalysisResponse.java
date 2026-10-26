package com.hiresense.modules.resume.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeAnalysisResponse {
    private Long id;
    private Long resumeId;
    private Integer versionNumber;
    private String targetRole;
    private String targetCompany;
    private String aiProvider; // 'GEMINI', 'MOCK', 'HEURISTIC'
    private String aiModel;
    private String promptVersion;
    private String analysisVersion;
    private Integer overallScore;
    private Integer atsOrientedScore;
    private boolean heuristicFallback;
    private ResumeAnalysisResultDto analysis;
    private Instant createdAt;
}
