package com.hiresense.modules.intelligence.model;

import com.hiresense.modules.auth.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "skill_gap_assessments", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "skill_name"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillGapAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "skill_name", nullable = false, length = 100)
    private String skillName;

    @Column(nullable = false, length = 80)
    @Builder.Default
    private String category = "TECHNICAL";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SkillStatus status;

    @Column(name = "observed_proficiency", nullable = false)
    @Builder.Default
    private Integer observedProficiency = 0;

    @Column(name = "required_proficiency", nullable = false)
    @Builder.Default
    private Integer requiredProficiency = 70;

    @Column(name = "gap_score", nullable = false)
    @Builder.Default
    private Integer gapScore = 0;

    @Column(name = "evidence_sources", nullable = false)
    private String evidenceSources; // 'RESUME,ASSESSMENT,INTERVIEW'

    @Column(name = "last_evaluated_at")
    @Builder.Default
    private Instant lastEvaluatedAt = Instant.now();
}
