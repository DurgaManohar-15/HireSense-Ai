package com.hiresense.modules.intelligence.dto;

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
public class CompanyReadinessDto {
    private Long companyId;
    private String companyName;
    private String companyTier;
    private int overallReadinessScore;
    private String benchmarkVersion;

    @Builder.Default
    private List<SkillGapDto> strongSkills = new ArrayList<>();

    @Builder.Default
    private List<SkillGapDto> moderateSkills = new ArrayList<>();

    @Builder.Default
    private List<SkillGapDto> gapSkills = new ArrayList<>();

    @Builder.Default
    private List<SkillGapDto> missingSkills = new ArrayList<>();
}
