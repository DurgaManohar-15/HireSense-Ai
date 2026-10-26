package com.hiresense.modules.resume.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "extracted_resume_skills")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExtractedResumeSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_analysis_id", nullable = false)
    private ResumeAnalysis resumeAnalysis;

    @Column(name = "skill_name", nullable = false, length = 100)
    private String skillName;

    @Column(nullable = false, length = 80)
    @Builder.Default
    private String category = "TECHNICAL";

    @Column(name = "is_verified_in_resume", nullable = false)
    @Builder.Default
    private boolean verifiedInResume = true;
}
