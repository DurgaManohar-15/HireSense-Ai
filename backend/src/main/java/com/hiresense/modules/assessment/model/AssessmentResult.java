package com.hiresense.modules.assessment.model;

import com.hiresense.modules.auth.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "assessment_results")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false, unique = true)
    private AssessmentSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id")
    private AssessmentDefinition assessmentDefinition;

    @Column(name = "assessment_title", nullable = false, length = 200)
    private String assessmentTitle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssessmentCategory category;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    @Column(name = "correct_count", nullable = false)
    private Integer correctCount;

    @Column(name = "incorrect_count", nullable = false)
    private Integer incorrectCount;

    @Column(name = "unanswered_count", nullable = false)
    private Integer unansweredCount;

    @Column(name = "total_marks_obtained", nullable = false, precision = 6, scale = 2)
    private BigDecimal totalMarksObtained;

    @Column(name = "max_marks", nullable = false, precision = 6, scale = 2)
    private BigDecimal maxMarks;

    @Column(name = "score_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal scorePercentage;

    @Column(name = "is_passed", nullable = false)
    private boolean passed;

    @Column(name = "time_taken_seconds", nullable = false)
    private Integer timeTakenSeconds;

    @OneToMany(mappedBy = "result", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TopicPerformanceAnalytics> topicAnalytics = new ArrayList<>();

    @OneToMany(mappedBy = "result", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DifficultyPerformanceAnalytics> difficultyAnalytics = new ArrayList<>();

    @Column(name = "completed_at", nullable = false)
    private Instant completedAt;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
