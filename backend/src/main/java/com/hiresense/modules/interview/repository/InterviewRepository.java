package com.hiresense.modules.interview.repository;

import com.hiresense.modules.interview.model.Interview;
import com.hiresense.modules.interview.model.InterviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    Optional<Interview> findByIdAndUserId(Long id, Long userId);
    List<Interview> findByUserIdOrderByStartedAtDesc(Long userId);
    Optional<Interview> findFirstByUserIdAndStatus(Long userId, InterviewStatus status);
}
