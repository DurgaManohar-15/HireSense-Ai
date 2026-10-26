package com.hiresense.modules.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitAnswerResponse {
    private TurnEvaluationDto turnEvaluation;
    private boolean finished;
    private InterviewQuestionDto nextQuestion;
    private Integer currentQuestionIndex;
    private Integer totalQuestions;
}
