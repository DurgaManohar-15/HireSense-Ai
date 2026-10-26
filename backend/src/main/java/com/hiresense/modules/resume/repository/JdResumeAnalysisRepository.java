package com.hiresense.modules.resume.repository;

import com.hiresense.modules.resume.model.JdResumeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JdResumeAnalysisRepository extends JpaRepository<JdResumeAnalysis, Long> {
    List<JdResumeAnalysis> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<JdResumeAnalysis> findByResumeIdOrderByCreatedAtDesc(Long resumeId);
    Optional<JdResumeAnalysis> findByIdAndUserId(Long id, Long userId);
    Optional<JdResumeAnalysis> findFirstByResumeIdAndJobDescriptionIdOrderByCreatedAtDesc(Long resumeId, Long jobDescriptionId);
    Optional<JdResumeAnalysis> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
}
