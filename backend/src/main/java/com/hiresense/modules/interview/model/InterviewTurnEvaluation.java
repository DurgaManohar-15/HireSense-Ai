package com.hiresense.modules.interview.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "interview_turn_evaluations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewTurnEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private InterviewQuestion question;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "answer_id", nullable = false, unique = true)
    private InterviewAnswer answer;

    @Column(name = "relevance_score", nullable = false)
    private Integer relevanceScore;

    @Column(name = "technical_correctness_score", nullable = false)
    private Integer technicalCorrectnessScore;

    @Column(name = "completeness_score", nullable = false)
    private Integer completenessScore;

    @Column(name = "clarity_score", nullable = false)
    private Integer clarityScore;

    @Column(name = "communication_score", nullable = false)
    private Integer communicationScore;

    @Column(name = "overall_turn_score", nullable = false)
    private Integer overallTurnScore;

    @Column(name = "evaluation_json", nullable = false, columnDefinition = "LONGTEXT")
    private String evaluationJson;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
