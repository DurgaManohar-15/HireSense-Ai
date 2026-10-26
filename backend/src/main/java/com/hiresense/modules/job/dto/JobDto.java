package com.hiresense.modules.job.dto;

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
public class JobDto {
    private Long id;
    private String title;
    private String company;
    private String location;
    private String country;
    private String industry;
    private String experienceLevel;
    private String salaryRange;
    private String workType;
    private String jobType;
    private String description;
    private String requirements;
    private String responsibilities;
    private List<String> skills;
    private String source;
    private String applyUrl;
    private boolean active;
    private Instant createdAt;

    // Matching fields when queried by an authenticated user
    private Integer matchScore;
    private boolean saved;
    private boolean applied;
}
