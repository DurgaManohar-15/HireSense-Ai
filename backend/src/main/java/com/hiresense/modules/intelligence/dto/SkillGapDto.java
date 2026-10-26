package com.hiresense.modules.intelligence.dto;

import com.hiresense.modules.intelligence.model.SkillStatus;
import com.hiresense.modules.resume.dto.SkillEvidenceDetailDto.LearningResourceDto;
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
public class SkillGapDto {
    private String skillName;
    private String category;
    private SkillStatus status;
    private int observedProficiency;
    private int requiredProficiency;
    private int gapScore;

    @Builder.Default
    private List<String> evidenceSources = new ArrayList<>();

    private String priority; // 'HIGH', 'MEDIUM', 'LOW'
    private String matchStatus; // 'STRONG_MATCH', 'PARTIAL_MATCH', 'WEAK_MATCH', 'NOT_DEMONSTRATED'
    private boolean isResumeKeywordGap;
    private boolean isActualSkillGap;
    private String evidenceSummary;

    @Builder.Default
    private List<LearningResourceDto> recommendedResources = new ArrayList<>();
}
