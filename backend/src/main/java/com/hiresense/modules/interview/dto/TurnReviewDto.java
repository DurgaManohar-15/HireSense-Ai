package com.hiresense.modules.interview.dto;

import com.hiresense.modules.interview.model.InterviewDifficulty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TurnReviewDto {
    private Integer sequenceNumber;
    private String questionText;
    private String topic;
    private InterviewDifficulty difficulty;
    private String answerText;
    private Integer wordCount;
    private Integer timeTakenSeconds;
    private String modelAnswer;
    private String practicalExample;
    private TurnEvaluationDto evaluation;
}
