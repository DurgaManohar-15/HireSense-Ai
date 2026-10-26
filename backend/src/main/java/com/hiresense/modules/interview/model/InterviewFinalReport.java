package com.hiresense.modules.interview.model;

import com.hiresense.modules.auth.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "interview_final_reports")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewFinalReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false, unique = true)
    private Interview interview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "overall_score", nullable = false)
    private Integer overallScore;

    @Column(name = "technical_score", nullable = false)
    private Integer technicalScore;

    @Column(name = "behavioral_score", nullable = false)
    private Integer behavioralScore;

    @Column(name = "communication_score", nullable = false)
    private Integer communicationScore;

    @Column(name = "is_passed", nullable = false)
    private boolean passed;

    @Column(name = "structured_report_json", nullable = false, columnDefinition = "LONGTEXT")
    private String structuredReportJson;

    @Column(name = "completed_at", nullable = false)
    private Instant completedAt;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
