package com.hiresense.modules.resumebuilder.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeAgentChatResponse {
    private String responseMessage;
    private String improvedText;
    private List<String> rationalePoints;
    private List<String> alternativeSuggestions;
    private boolean requiresUserClarification;
    private String clarificationQuestion;
}
