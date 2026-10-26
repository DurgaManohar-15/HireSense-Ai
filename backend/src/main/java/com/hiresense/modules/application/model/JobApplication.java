package com.hiresense.modules.application.model;

import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.job.model.Job;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "job_applications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id")
    private Job job;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "role_title", nullable = false)
    private String roleTitle;

    @Column(name = "job_url")
    private String jobUrl;

    @Column(name = "location")
    private String location;

    @Column(name = "salary_offered")
    private String salaryOffered;

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "APPLIED"; // SAVED, APPLIED, ASSESSMENT, INTERVIEW, TECHNICAL_ROUND, HR_ROUND, OFFER, REJECTED, WITHDRAWN

    @Column(name = "resume_version_name")
    private String resumeVersionName;

    @Column(name = "cover_letter_title")
    private String coverLetterTitle;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "applied_date")
    private LocalDate appliedDate;

    @Column(name = "interview_date")
    private LocalDate interviewDate;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt DESC")
    @Builder.Default
    private List<ApplicationStatusHistory> statusHistories = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.appliedDate == null) {
            this.appliedDate = LocalDate.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
