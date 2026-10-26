package com.hiresense.modules.resume.model;

import com.hiresense.modules.auth.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "jd_resume_analyses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JdResumeAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_description_id")
    private JobDescription jobDescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_analysis_id", nullable = false)
    private ResumeAnalysis resumeAnalysis;

    @Column(name = "jd_match_score", nullable = false)
    private Integer jdMatchScore;

    @Builder.Default
    @Column(name = "strong_matches_count", nullable = false)
    private Integer strongMatchesCount = 0;

    @Builder.Default
    @Column(name = "partial_matches_count", nullable = false)
    private Integer partialMatchesCount = 0;

    @Builder.Default
    @Column(name = "weak_matches_count", nullable = false)
    private Integer weakMatchesCount = 0;

    @Builder.Default
    @Column(name = "missing_matches_count", nullable = false)
    private Integer missingMatchesCount = 0;

    @Column(name = "structured_match_json", nullable = false, columnDefinition = "LONGTEXT")
    private String structuredMatchJson;

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();
}
