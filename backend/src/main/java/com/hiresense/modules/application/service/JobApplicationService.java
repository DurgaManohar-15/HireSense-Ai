package com.hiresense.modules.application.service;

import com.hiresense.modules.application.dto.ApplicationAnalyticsDto;
import com.hiresense.modules.application.dto.JobApplicationDto;
import com.hiresense.modules.application.model.ApplicationStatusHistory;
import com.hiresense.modules.application.model.JobApplication;
import com.hiresense.modules.application.repository.ApplicationStatusHistoryRepository;
import com.hiresense.modules.application.repository.JobApplicationRepository;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.job.model.Job;
import com.hiresense.modules.job.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    @Transactional(readOnly = true)
    public List<JobApplicationDto> getMyApplications(Long userId) {
        return applicationRepository.findByUserIdOrderByUpdatedAtDesc(userId)
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobApplicationDto getApplicationById(Long id, Long userId) {
        JobApplication app = applicationRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new IllegalArgumentException("Application not found"));
        return toDto(app);
    }

    @Transactional
    public JobApplicationDto createApplication(Long userId, JobApplicationDto dto) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Job job = null;
        if (dto.getJobId() != null) {
            job = jobRepository.findById(dto.getJobId()).orElse(null);
        }

        JobApplication app = JobApplication.builder()
            .user(user)
            .job(job)
            .companyName(dto.getCompanyName() != null ? dto.getCompanyName().trim() : (job != null ? job.getCompany() : "Unknown"))
            .roleTitle(dto.getRoleTitle() != null ? dto.getRoleTitle().trim() : (job != null ? job.getTitle() : "Candidate Role"))
            .jobUrl(dto.getJobUrl() != null ? dto.getJobUrl() : (job != null ? job.getApplyUrl() : null))
            .location(dto.getLocation() != null ? dto.getLocation() : (job != null ? job.getLocation() : null))
            .salaryOffered(dto.getSalaryOffered())
            .status(dto.getStatus() != null ? dto.getStatus() : "APPLIED")
            .resumeVersionName(dto.getResumeVersionName())
            .coverLetterTitle(dto.getCoverLetterTitle())
            .notes(dto.getNotes())
            .appliedDate(dto.getAppliedDate() != null ? dto.getAppliedDate() : LocalDate.now())
            .interviewDate(dto.getInterviewDate())
            .followUpDate(dto.getFollowUpDate())
            .build();

        JobApplication saved = applicationRepository.save(app);

        // Record initial status
        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
            .application(saved)
            .previousStatus(null)
            .newStatus(saved.getStatus())
            .notes("Application registered on HireSense platform.")
            .build();
        historyRepository.save(history);

        return toDto(saved);
    }

    @Transactional
    public JobApplicationDto updateStatus(Long id, Long userId, String newStatus, String notes) {
        JobApplication app = applicationRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        String oldStatus = app.getStatus();
        app.setStatus(newStatus);
        JobApplication updated = applicationRepository.save(app);

        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
            .application(updated)
            .previousStatus(oldStatus)
            .newStatus(newStatus)
            .notes(notes != null ? notes : "Stage updated to " + newStatus)
            .build();
        historyRepository.save(history);

        return toDto(updated);
    }

    @Transactional
    public JobApplicationDto updateApplication(Long id, Long userId, JobApplicationDto dto) {
        JobApplication app = applicationRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        if (dto.getCompanyName() != null) app.setCompanyName(dto.getCompanyName().trim());
        if (dto.getRoleTitle() != null) app.setRoleTitle(dto.getRoleTitle().trim());
        if (dto.getJobUrl() != null) app.setJobUrl(dto.getJobUrl());
        if (dto.getLocation() != null) app.setLocation(dto.getLocation());
        if (dto.getSalaryOffered() != null) app.setSalaryOffered(dto.getSalaryOffered());
        if (dto.getNotes() != null) app.setNotes(dto.getNotes());
        if (dto.getInterviewDate() != null) app.setInterviewDate(dto.getInterviewDate());
        if (dto.getFollowUpDate() != null) app.setFollowUpDate(dto.getFollowUpDate());
        if (dto.getResumeVersionName() != null) app.setResumeVersionName(dto.getResumeVersionName());
        if (dto.getCoverLetterTitle() != null) app.setCoverLetterTitle(dto.getCoverLetterTitle());

        if (dto.getStatus() != null && !dto.getStatus().equals(app.getStatus())) {
            String oldStatus = app.getStatus();
            app.setStatus(dto.getStatus());
            ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(app)
                .previousStatus(oldStatus)
                .newStatus(dto.getStatus())
                .notes("Application details updated.")
                .build();
            historyRepository.save(history);
        }

        return toDto(applicationRepository.save(app));
    }

    @Transactional
    public void deleteApplication(Long id, Long userId) {
        JobApplication app = applicationRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new IllegalArgumentException("Application not found"));
        applicationRepository.delete(app);
    }

    @Transactional(readOnly = true)
    public ApplicationAnalyticsDto getAnalytics(Long userId) {
        List<JobApplication> list = applicationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        long total = list.size();
        Map<String, Long> counts = list.stream()
            .collect(Collectors.groupingBy(JobApplication::getStatus, Collectors.counting()));

        long offers = counts.getOrDefault("OFFER", 0L);
        long interviews = counts.getOrDefault("INTERVIEW", 0L)
            + counts.getOrDefault("TECHNICAL_ROUND", 0L)
            + counts.getOrDefault("HR_ROUND", 0L)
            + offers;
        long rejected = counts.getOrDefault("REJECTED", 0L);
        long active = total - offers - rejected - counts.getOrDefault("WITHDRAWN", 0L);

        double interviewRate = total > 0 ? ((double) interviews / total) * 100.0 : 0.0;
        double offerRate = total > 0 ? ((double) offers / total) * 100.0 : 0.0;

        return ApplicationAnalyticsDto.builder()
            .totalApplications(total)
            .activeApplications(Math.max(0, active))
            .interviewCount(interviews)
            .offerCount(offers)
            .rejectedCount(rejected)
            .interviewConversionRate(Math.round(interviewRate * 10.0) / 10.0)
            .offerConversionRate(Math.round(offerRate * 10.0) / 10.0)
            .statusBreakdown(counts)
            .build();
    }

    private JobApplicationDto toDto(JobApplication app) {
        List<JobApplicationDto.StatusHistoryDto> timeline = (app.getStatusHistories() != null)
            ? app.getStatusHistories().stream()
                .map(h -> JobApplicationDto.StatusHistoryDto.builder()
                    .id(h.getId())
                    .previousStatus(h.getPreviousStatus())
                    .newStatus(h.getNewStatus())
                    .notes(h.getNotes())
                    .createdAt(h.getCreatedAt())
                    .build())
                .collect(Collectors.toList())
            : List.of();

        return JobApplicationDto.builder()
            .id(app.getId())
            .jobId(app.getJob() != null ? app.getJob().getId() : null)
            .companyName(app.getCompanyName())
            .roleTitle(app.getRoleTitle())
            .jobUrl(app.getJobUrl())
            .location(app.getLocation())
            .salaryOffered(app.getSalaryOffered())
            .status(app.getStatus())
            .resumeVersionName(app.getResumeVersionName())
            .coverLetterTitle(app.getCoverLetterTitle())
            .notes(app.getNotes())
            .appliedDate(app.getAppliedDate())
            .interviewDate(app.getInterviewDate())
            .followUpDate(app.getFollowUpDate())
            .createdAt(app.getCreatedAt())
            .updatedAt(app.getUpdatedAt())
            .timeline(timeline)
            .build();
    }
}
