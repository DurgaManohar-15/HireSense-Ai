package com.hiresense.modules.interview.dto;

import com.hiresense.modules.interview.model.InterviewDifficulty;
import com.hiresense.modules.interview.model.InterviewType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewFinalReportResponse {
    private Long id;
    private Long interviewId;
    private InterviewType interviewType;
    private InterviewDifficulty difficulty;
    private String targetRole;
    private String targetCompany;
    private String topic;
    private Integer overallScore;
    private Integer technicalScore;
    private Integer behavioralScore;
    private Integer communicationScore;
    private boolean passed;
    private String aiProvider;
    private String aiModel;
    private InterviewFinalReportDto report;

    @Builder.Default
    private List<TurnReviewDto> turnReviews = new ArrayList<>();

    private Instant completedAt;
}
