package com.hiresense.modules.resume.dto;

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
public class JobDescriptionDto {

    private Long id;
    private String title;
    private String company;
    private String location;
    private String rawText;
    private boolean active;
    private Instant createdAt;

    // Extracted requirements
    @Builder.Default
    private List<String> requiredSkills = new ArrayList<>();

    @Builder.Default
    private List<String> preferredSkills = new ArrayList<>();

    @Builder.Default
    private List<String> programmingLanguages = new ArrayList<>();

    @Builder.Default
    private List<String> frameworks = new ArrayList<>();

    @Builder.Default
    private List<String> databases = new ArrayList<>();

    @Builder.Default
    private List<String> toolsAndCloud = new ArrayList<>();

    @Builder.Default
    private List<String> softSkills = new ArrayList<>();

    private String experienceRequirement;
    private String educationRequirement;
    
    @Builder.Default
    private List<String> responsibilities = new ArrayList<>();
}
