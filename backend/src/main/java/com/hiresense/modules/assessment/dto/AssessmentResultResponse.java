package com.hiresense.modules.assessment.dto;

import com.hiresense.modules.assessment.model.AssessmentCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentResultResponse {
    private Long id;
    private Long sessionId;
    private Long assessmentId;
    private String assessmentTitle;
    private AssessmentCategory category;
    private Integer totalQuestions;
    private Integer correctCount;
    private Integer incorrectCount;
    private Integer unansweredCount;
    private BigDecimal totalMarksObtained;
    private BigDecimal maxMarks;
    private BigDecimal scorePercentage;
    private boolean passed;
    private Integer timeTakenSeconds;
    private String performanceBand;
    private String resultSummary;

    @Builder.Default
    private List<String> strengths = new ArrayList<>();

    @Builder.Default
    private List<String> weaknesses = new ArrayList<>();

    @Builder.Default
    private List<String> studyRecommendations = new ArrayList<>();

    private List<TopicPerformanceDto> topicPerformance;
    private List<DifficultyPerformanceDto> difficultyPerformance;
    private List<QuestionReviewDto> questionReviews;
    private Instant completedAt;
}
