package com.hiresense.modules.resume.dto;

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
public class ScoreCategoryDetailDto {

    private String categoryName;
    private Integer score; // 0-100
    private Double weight; // e.g. 0.20
    private Integer weightedScore; // score * weight

    @Builder.Default
    private List<String> whatIsGood = new ArrayList<>();

    @Builder.Default
    private List<String> whatNeedsImprovement = new ArrayList<>();

    @Builder.Default
    private List<String> recommendedActions = new ArrayList<>();
}
