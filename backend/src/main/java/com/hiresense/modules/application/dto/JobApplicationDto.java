package com.hiresense.modules.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationDto {
    private Long id;
    private Long jobId;
    private String companyName;
    private String roleTitle;
    private String jobUrl;
    private String location;
    private String salaryOffered;
    private String status;
    private String resumeVersionName;
    private String coverLetterTitle;
    private String notes;
    private LocalDate appliedDate;
    private LocalDate interviewDate;
    private LocalDate followUpDate;
    private Instant createdAt;
    private Instant updatedAt;
    private List<StatusHistoryDto> timeline;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusHistoryDto {
        private Long id;
        private String previousStatus;
        private String newStatus;
        private String notes;
        private Instant createdAt;
    }
}
