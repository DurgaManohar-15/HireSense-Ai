package com.hiresense.modules.intelligence.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapResourceDto {
    private String title;
    private String url;
    private String type; // 'DOCUMENTATION', 'PRACTICE', 'VIDEO', 'CHEATSHEET', 'ARTICLE'
    private String description;
    private String estimatedReadTime;
}
