package com.hiresense.modules.interview.dto;

import com.hiresense.modules.interview.model.InterviewDifficulty;
import com.hiresense.modules.interview.model.InterviewStatus;
import com.hiresense.modules.interview.model.InterviewType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewHistorySummaryDto {
    private Long id;
    private InterviewType interviewType;
    private InterviewDifficulty difficulty;
    private String targetRole;
    private String targetCompany;
    private String topic;
    private Integer totalQuestions;
    private Integer overallScore;
    private boolean passed;
    private InterviewStatus status;
    private String aiProvider;
    private Instant startedAt;
    private Instant completedAt;
}
