package com.hiresense.modules.intelligence.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapDto {
    private Long id;
    private int versionNumber;
    private String targetRole;
    private String targetCompany;
    private int durationDays;
    private int hoursPerDay;
    private int totalTasks;
    private int completedTasks;
    private int progressPercentage;
    private boolean active;
    private String aiProvider;

    @Builder.Default
    private List<RoadmapTaskDto> tasks = new ArrayList<>();

    private Instant createdAt;
}
