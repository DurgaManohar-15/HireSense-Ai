package com.hiresense.modules.interview.dto;

import com.hiresense.modules.interview.model.InterviewDifficulty;
import com.hiresense.modules.interview.model.InterviewType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartInterviewRequest {

    @NotNull(message = "Interview type is required")
    private InterviewType interviewType;

    @Builder.Default
    private InterviewDifficulty difficulty = InterviewDifficulty.ADAPTIVE;

    private String targetRole;
    private String targetCompany;
    private String topic;

    @Builder.Default
    private Integer totalQuestions = 5;
}
