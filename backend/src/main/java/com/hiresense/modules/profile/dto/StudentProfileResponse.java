package com.hiresense.modules.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileResponse {
    private Long id;
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String collegeName;
    private String degree;
    private String branch;
    private Integer graduationYear;
    private BigDecimal cgpa;
    private String targetRole;
    private TargetCompanyResponse targetCompany;
    private Integer targetTimelineWeeks;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private String bio;
    private List<SkillDto> skills;
    private List<StudentProjectDto> projects;
    private List<StudentCertificationDto> certifications;
    private boolean profileComplete;
    private Instant createdAt;
    private Instant updatedAt;
}
