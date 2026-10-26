package com.hiresense.modules.profile.dto;

import com.hiresense.modules.profile.model.CompanyTier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TargetCompanyResponse {
    private Long id;
    private String name;
    private CompanyTier tier;
    private String description;
    private String websiteUrl;
    private List<CompanyBenchmarkDto> benchmarks;
}
