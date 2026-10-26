package com.hiresense.modules.assessment.dto;

import com.hiresense.modules.assessment.model.AssessmentCategory;
import com.hiresense.modules.assessment.model.AssessmentSessionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentSessionDto {
    private Long id;
    private Long assessmentId;
    private String assessmentTitle;
    private AssessmentCategory category;
    private AssessmentSessionStatus status;
    private Integer totalQuestions;
    private Integer durationMinutes;
    private Long remainingSeconds;
    private Instant startedAt;
    private Instant expiresAt;
    private List<QuestionDto> questions;
}
