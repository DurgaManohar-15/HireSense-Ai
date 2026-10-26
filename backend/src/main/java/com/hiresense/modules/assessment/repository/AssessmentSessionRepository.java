package com.hiresense.modules.assessment.repository;

import com.hiresense.modules.assessment.model.AssessmentSession;
import com.hiresense.modules.assessment.model.AssessmentSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentSessionRepository extends JpaRepository<AssessmentSession, Long> {
    Optional<AssessmentSession> findByIdAndUserId(Long id, Long userId);
    List<AssessmentSession> findByUserIdOrderByStartedAtDesc(Long userId);
    Optional<AssessmentSession> findFirstByUserIdAndStatus(Long userId, AssessmentSessionStatus status);
}
