package com.hiresense.modules.interview.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "interview_answers", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"interview_id", "question_id"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private InterviewQuestion question;

    @Column(name = "answer_text", nullable = false, columnDefinition = "LONGTEXT")
    private String answerText;

    @Column(name = "word_count", nullable = false)
    @Builder.Default
    private Integer wordCount = 0;

    @Column(name = "time_taken_seconds", nullable = false)
    @Builder.Default
    private Integer timeTakenSeconds = 0;

    @OneToOne(mappedBy = "answer", cascade = CascadeType.ALL, orphanRemoval = true)
    private InterviewTurnEvaluation evaluation;

    @Column(name = "answered_at", updatable = false)
    @Builder.Default
    private Instant answeredAt = Instant.now();
}
