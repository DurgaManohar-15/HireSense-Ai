package com.hiresense.modules.profile.dto;

import com.hiresense.modules.profile.model.SkillProficiency;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillDto {
    private Long id;
    
    @NotBlank(message = "Skill name is required")
    private String name;
    
    private String category;
    
    @Builder.Default
    private SkillProficiency proficiencyLevel = SkillProficiency.BEGINNER;
    
    private boolean verifiedByAssessment;
}
