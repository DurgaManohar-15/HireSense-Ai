package com.hiresense.modules.resume.model;

import com.hiresense.modules.auth.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "resume_analyses")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "target_role", length = 150)
    private String targetRole;

    @Column(name = "target_company", length = 150)
    private String targetCompany;

    @Column(name = "ai_provider", nullable = false, length = 50)
    private String aiProvider; // 'GEMINI', 'MOCK', 'HEURISTIC'

    @Column(name = "ai_model", nullable = false, length = 100)
    private String aiModel;

    @Column(name = "prompt_version", nullable = false, length = 50)
    @Builder.Default
    private String promptVersion = "v1.0.0";

    @Column(name = "analysis_version", nullable = false, length = 50)
    @Builder.Default
    private String analysisVersion = "v1.0.0";

    @Column(name = "overall_score", nullable = false)
    private Integer overallScore;

    @Column(name = "ats_oriented_score", nullable = false)
    private Integer atsOrientedScore;

    @Column(name = "is_heuristic_fallback", nullable = false)
    @Builder.Default
    private boolean heuristicFallback = false;

    @Column(name = "structured_analysis_json", nullable = false, columnDefinition = "LONGTEXT")
    private String structuredAnalysisJson;

    @OneToMany(mappedBy = "resumeAnalysis", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ExtractedResumeSkill> extractedSkills = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
