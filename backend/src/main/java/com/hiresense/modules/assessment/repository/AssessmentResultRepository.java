package com.hiresense.modules.assessment.repository;

import com.hiresense.modules.assessment.model.AssessmentResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentResultRepository extends JpaRepository<AssessmentResult, Long> {
    Optional<AssessmentResult> findBySessionId(Long sessionId);
    Optional<AssessmentResult> findByIdAndUserId(Long id, Long userId);
    List<AssessmentResult> findByUserIdOrderByCompletedAtDesc(Long userId);
    long countByUserId(Long userId);
}
