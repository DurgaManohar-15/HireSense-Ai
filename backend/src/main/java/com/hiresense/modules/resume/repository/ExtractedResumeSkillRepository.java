package com.hiresense.modules.resume.repository;

import com.hiresense.modules.resume.model.ExtractedResumeSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExtractedResumeSkillRepository extends JpaRepository<ExtractedResumeSkill, Long> {
    List<ExtractedResumeSkill> findByResumeAnalysisId(Long resumeAnalysisId);
}
