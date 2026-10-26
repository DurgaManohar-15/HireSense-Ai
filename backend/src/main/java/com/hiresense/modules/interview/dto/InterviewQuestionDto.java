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
public class InterviewQuestionDto {
    private Long id;
    private Integer sequenceNumber;
    private String category;
    private String topic;
    private InterviewDifficulty difficulty;
    private String questionText;
    private String contextRationale;
}
