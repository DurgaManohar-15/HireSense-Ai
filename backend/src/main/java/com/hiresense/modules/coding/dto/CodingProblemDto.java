package com.hiresense.modules.coding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodingProblemDto {
    private Long id;
    private String title;
    private String slug;
    private String difficulty;
    private String topic;
    private List<String> companyTags;
    private List<String> roleTags;
    private String frequencyTag;
    private Integer frequencyScore;
    private String description;
    private String constraints;
    private String examplesJson;
    private String starterCodeJson;
    private String hintsJson;
    private String solutionJson;
    private boolean solved;
    private String userStatus; // UNSOLVED, ATTEMPTED, SOLVED
    private Instant createdAt;
}
