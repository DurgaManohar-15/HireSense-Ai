package com.hiresense.modules.resumebuilder.model;

import com.hiresense.modules.auth.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "resume_versions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "target_role")
    private String targetRole;

    @Column(name = "template_id", nullable = false)
    @Builder.Default
    private String templateId = "ats_minimal"; // ats_minimal, modern, professional, tech_engineer, student, creative

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "location")
    private String location;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    @Column(name = "summary", columnDefinition = "LONGTEXT")
    private String summary;

    @Column(name = "skills_json", columnDefinition = "LONGTEXT")
    private String skillsJson; // JSON array of skills/categories

    @Column(name = "experiences_json", columnDefinition = "LONGTEXT")
    private String experiencesJson; // JSON array of work/internships

    @Column(name = "educations_json", columnDefinition = "LONGTEXT")
    private String educationsJson; // JSON array of education history

    @Column(name = "projects_json", columnDefinition = "LONGTEXT")
    private String projectsJson; // JSON array of technical projects

    @Column(name = "certifications_json", columnDefinition = "LONGTEXT")
    private String certificationsJson; // JSON array of certifications

    @Column(name = "achievements_json", columnDefinition = "LONGTEXT")
    private String achievementsJson; // JSON array of achievements

    @Column(name = "languages_json", columnDefinition = "LONGTEXT")
    private String languagesJson;

    @Column(name = "is_master", nullable = false)
    @Builder.Default
    private boolean master = false;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
