package com.hiresense.modules.resume.repository;

import com.hiresense.modules.resume.model.ResumeImprovementSuggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeImprovementSuggestionRepository extends JpaRepository<ResumeImprovementSuggestion, Long> {
    List<ResumeImprovementSuggestion> findByResumeAnalysisIdOrderByCreatedAtAsc(Long resumeAnalysisId);
    List<ResumeImprovementSuggestion> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<ResumeImprovementSuggestion> findByIdAndUserId(Long id, Long userId);
}
