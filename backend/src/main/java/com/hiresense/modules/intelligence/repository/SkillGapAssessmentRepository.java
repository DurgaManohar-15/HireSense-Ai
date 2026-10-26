package com.hiresense.modules.intelligence.repository;

import com.hiresense.modules.intelligence.model.SkillGapAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillGapAssessmentRepository extends JpaRepository<SkillGapAssessment, Long> {
    List<SkillGapAssessment> findByUserIdOrderByGapScoreDesc(Long userId);
    Optional<SkillGapAssessment> findByUserIdAndSkillName(Long userId, String skillName);
    void deleteByUserId(Long userId);
}
