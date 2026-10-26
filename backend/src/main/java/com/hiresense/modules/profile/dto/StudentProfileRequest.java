package com.hiresense.modules.profile.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileRequest {

    @NotBlank(message = "Student name is required")
    private String firstName;

    private String lastName;

    private String collegeName;

    private String degree;

    private String branch;

    @Min(value = 2000, message = "Graduation year must be valid")
    @Max(value = 2040, message = "Graduation year must be realistic")
    private Integer graduationYear;

    @DecimalMin(value = "0.0", message = "CGPA cannot be negative")
    @DecimalMax(value = "10.0", message = "CGPA cannot exceed 10.0")
    private BigDecimal cgpa;

    private String targetRole;

    private Long targetCompanyId;

    @Min(value = 1, message = "Target timeline must be at least 1 week")
    @Max(value = 52, message = "Target timeline cannot exceed 52 weeks")
    private Integer targetTimelineWeeks;

    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private String bio;

    @Valid
    private List<SkillDto> skills;

    @Valid
    private List<StudentProjectDto> projects;

    @Valid
    private List<StudentCertificationDto> certifications;
}
