package com.hiresense.modules.profile.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProjectDto {
    private Long id;

    @NotBlank(message = "Project title is required")
    private String title;

    private String description;

    private String technologiesUsed;

    private String githubLink;
    private String liveDemoLink;
}
