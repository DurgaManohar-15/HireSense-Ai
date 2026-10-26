package com.hiresense.modules.resumebuilder.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeVersionDto {
    private Long id;
    private String title;
    private String targetRole;
    private String templateId;
    private String fullName;
    private String email;
    private String phone;
    private String location;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private String summary;
    private String skillsJson;
    private String experiencesJson;
    private String educationsJson;
    private String projectsJson;
    private String certificationsJson;
    private String achievementsJson;
    private String languagesJson;
    private boolean master;
    private Instant createdAt;
    private Instant updatedAt;
}
