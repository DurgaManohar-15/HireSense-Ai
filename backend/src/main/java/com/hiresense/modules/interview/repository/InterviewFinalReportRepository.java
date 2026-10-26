package com.hiresense.modules.interview.repository;

import com.hiresense.modules.interview.model.InterviewFinalReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewFinalReportRepository extends JpaRepository<InterviewFinalReport, Long> {
    Optional<InterviewFinalReport> findByInterviewId(Long interviewId);
    Optional<InterviewFinalReport> findByIdAndUserId(Long id, Long userId);
    List<InterviewFinalReport> findByUserIdOrderByCompletedAtDesc(Long userId);
}
