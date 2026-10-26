package com.hiresense.modules.intelligence.dto;

import com.hiresense.modules.intelligence.model.ReadinessBand;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlacementReadinessDto {
    private Integer prsScore;
    private Integer confidenceScore;
    private ReadinessBand readinessBand;
    private String scoringVersion;
    private String targetRole;
    private String targetCompany;
    private Integer companyReadinessScore;

    // Component Scores (Normalized 0-100)
    private Integer codingScore;
    private Integer technicalScore;
    private Integer aptitudeScore;
    private Integer resumeScore;
    private Integer interviewScore;
    private Integer communicationScore;

    private Map<String, Double> componentWeights;
    private int availableEvidenceCount;
    private String explanationSummary;
    private String strongestArea;
    private String biggestOpportunity;

    @Builder.Default
    private List<String> recommendations = new ArrayList<>();

    private Instant calculatedAt;
}
