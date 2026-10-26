package com.hiresense.modules.resumebuilder.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeAgentChatRequest {
    private Long resumeVersionId;
    private String section; // SUMMARY, EXPERIENCE, PROJECT, SKILLS, BULLET
    private String currentText;
    private String userPrompt; // e.g. "Make this concise", "Add measurable impact", "Target for Java Developer"
    private String targetRole;
}
