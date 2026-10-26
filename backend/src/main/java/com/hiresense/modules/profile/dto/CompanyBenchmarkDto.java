package com.hiresense.modules.profile.dto;

import com.hiresense.modules.profile.model.BenchmarkCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyBenchmarkDto {
    private Long id;
    private String skillName;
    private BenchmarkCategory category;
    private BigDecimal minimumProficiency;
    private BigDecimal weight;
}
