package com.hiresense.modules.intelligence.model;

import com.hiresense.modules.auth.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "placement_readiness_snapshots")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlacementReadinessSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "prs_score", nullable = false)
    private Integer prsScore;

    @Column(name = "confidence_score", nullable = false)
    private Integer confidenceScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "readiness_band", nullable = false, length = 50)
    private ReadinessBand readinessBand;

    @Column(name = "scoring_version", nullable = false, length = 50)
    @Builder.Default
    private String scoringVersion = "PRS_v1.0.0";

    @Column(name = "target_role", length = 150)
    private String targetRole;

    @Column(name = "target_company", length = 150)
    private String targetCompany;

    @Column(name = "company_readiness_score")
    private Integer companyReadinessScore;

    @Column(name = "coding_score")
    private Integer codingScore;

    @Column(name = "technical_score")
    private Integer technicalScore;

    @Column(name = "aptitude_score")
    private Integer aptitudeScore;

    @Column(name = "resume_score")
    private Integer resumeScore;

    @Column(name = "interview_score")
    private Integer interviewScore;

    @Column(name = "communication_score")
    private Integer communicationScore;

    @Column(name = "component_breakdown_json", nullable = false, columnDefinition = "LONGTEXT")
    private String componentBreakdownJson;

    @Column(name = "explanation_summary", nullable = false, columnDefinition = "TEXT")
    private String explanationSummary;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
