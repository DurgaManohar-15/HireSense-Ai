package com.hiresense.modules.job.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "company", nullable = false)
    private String company;

    @Column(name = "location", nullable = false)
    private String location;

    @Column(name = "country", nullable = false)
    @Builder.Default
    private String country = "India";

    @Column(name = "industry")
    @Builder.Default
    private String industry = "Information Technology";

    @Column(name = "experience_level", nullable = false)
    @Builder.Default
    private String experienceLevel = "Fresher";

    @Column(name = "salary_range")
    private String salaryRange;

    @Column(name = "work_type", nullable = false)
    @Builder.Default
    private String workType = "HYBRID"; // REMOTE, HYBRID, ONSITE

    @Column(name = "job_type", nullable = false)
    @Builder.Default
    private String jobType = "FULL_TIME"; // FULL_TIME, INTERNSHIP, CONTRACT

    @Column(name = "description", columnDefinition = "LONGTEXT")
    private String description;

    @Column(name = "requirements", columnDefinition = "LONGTEXT")
    private String requirements;

    @Column(name = "responsibilities", columnDefinition = "LONGTEXT")
    private String responsibilities;

    @Column(name = "skills", columnDefinition = "TEXT")
    private String skills; // comma-separated

    @Column(name = "source", nullable = false)
    @Builder.Default
    private String source = "HireSense Direct";

    @Column(name = "apply_url")
    private String applyUrl;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }
}
