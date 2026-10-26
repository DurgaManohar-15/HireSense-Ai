package com.hiresense.modules.ai;

import com.hiresense.modules.resume.dto.ResumeAnalysisResultDto;
import com.hiresense.modules.resume.service.AdvancedResumeScorerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
@RequiredArgsConstructor
public class HeuristicResumeAnalyzer {

    private final AdvancedResumeScorerService scorerService;

    public ResumeAnalysisResultDto analyze(String resumeText, String targetRole, String targetCompany) {
        return analyze(resumeText, targetRole, targetCompany, null);
    }

    public ResumeAnalysisResultDto analyze(String resumeText, String targetRole, String targetCompany, String jobDescription) {
        return scorerService.computeDeterministicAnalysis(
                resumeText,
                targetRole,
                targetCompany,
                jobDescription,
                Collections.emptyList(),
                Collections.emptyMap(),
                Collections.emptyMap()
        );
    }
}
