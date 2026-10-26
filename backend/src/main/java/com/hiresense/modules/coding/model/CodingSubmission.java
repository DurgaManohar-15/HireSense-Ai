package com.hiresense.modules.coding.model;

import com.hiresense.modules.auth.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "coding_submissions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodingSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private CodingProblem problem;

    @Column(name = "language", nullable = false)
    private String language; // java, python, javascript, cpp

    @Column(name = "code", columnDefinition = "LONGTEXT", nullable = false)
    private String code;

    @Column(name = "status", nullable = false)
    private String status; // ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, RUNTIME_ERROR

    @Column(name = "passed_test_cases", nullable = false)
    private Integer passedTestCases;

    @Column(name = "total_test_cases", nullable = false)
    private Integer totalTestCases;

    @Column(name = "runtime_ms")
    private Long runtimeMs;

    @Column(name = "memory_mb")
    private Double memoryMb;

    @Column(name = "submitted_at", updatable = false)
    private Instant submittedAt;

    @PrePersist
    protected void onCreate() {
        this.submittedAt = Instant.now();
    }
}
