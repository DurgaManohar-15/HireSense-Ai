package com.hiresense.modules.resume.repository;

import com.hiresense.modules.resume.model.ResumeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysis, Long> {
    Optional<ResumeAnalysis> findByIdAndUserId(Long id, Long userId);
    Optional<ResumeAnalysis> findFirstByResumeIdOrderByCreatedAtDesc(Long resumeId);
    List<ResumeAnalysis> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<ResumeAnalysis> findFirstByResumeIdAndTargetRoleAndPromptVersion(Long resumeId, String targetRole, String promptVersion);
}
