package com.hiresense.modules.assessment.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "student_responses", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"session_id", "question_id"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private AssessmentSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_option_id")
    private QuestionOption selectedOption;

    @Column(name = "is_marked_for_review", nullable = false)
    @Builder.Default
    private boolean markedForReview = false;

    @Column(name = "is_correct")
    private Boolean correct;

    @Column(name = "answered_at")
    @Builder.Default
    private Instant answeredAt = Instant.now();

    @PreUpdate
    public void preUpdate() {
        this.answeredAt = Instant.now();
    }
}
