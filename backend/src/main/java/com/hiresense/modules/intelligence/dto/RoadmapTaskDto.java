package com.hiresense.modules.intelligence.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapTaskDto {
    private Long id;
    private int dayNumber;
    private String topic;
    private String skillName;
    private String activityType; // 'LEARN', 'PRACTICE', 'QUIZ', 'CODING', 'MOCK_INTERVIEW', 'RESUME_POLISH'
    private int estimatedDurationMinutes;
    private String priority;
    private String learningObjective;
    private java.util.List<RoadmapResourceDto> resources;
    private boolean completed;
    private boolean skipped;
    private Instant completedAt;
}
