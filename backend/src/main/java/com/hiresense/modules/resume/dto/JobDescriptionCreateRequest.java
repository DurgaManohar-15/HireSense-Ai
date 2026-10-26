package com.hiresense.modules.resume.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDescriptionCreateRequest {

    @NotBlank(message = "Job title is required")
    private String title;

    private String company;
    private String location;

    @NotBlank(message = "Job description text is required")
    private String rawText;
}
