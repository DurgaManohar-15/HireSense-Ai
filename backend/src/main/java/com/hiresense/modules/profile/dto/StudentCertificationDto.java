package com.hiresense.modules.profile.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentCertificationDto {
    private Long id;

    @NotBlank(message = "Certification title is required")
    private String title;

    private String issuingOrganization;

    private LocalDate issueDate;
    private String credentialId;
    private String credentialUrl;
}
