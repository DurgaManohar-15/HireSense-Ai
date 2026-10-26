package com.hiresense.modules.interview.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "interview_questions", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"interview_id", "sequence_number"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @Column(name = "sequence_number", nullable = false)
    private Integer sequenceNumber; // 1, 2, 3...

    @Column(nullable = false, length = 80)
    private String category; // 'HR', 'TECHNICAL', 'PROJECT'

    @Column(nullable = false, length = 100)
    private String topic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private InterviewDifficulty difficulty = InterviewDifficulty.MEDIUM;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "context_rationale", columnDefinition = "TEXT")
    private String contextRationale;

    @OneToOne(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private InterviewAnswer answer;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
