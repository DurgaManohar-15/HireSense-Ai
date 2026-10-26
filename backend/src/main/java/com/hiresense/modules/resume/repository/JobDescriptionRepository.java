package com.hiresense.modules.resume.repository;

import com.hiresense.modules.resume.model.JobDescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobDescriptionRepository extends JpaRepository<JobDescription, Long> {
    List<JobDescription> findByUserIdAndActiveTrueOrderByCreatedAtDesc(Long userId);
    List<JobDescription> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<JobDescription> findByIdAndUserId(Long id, Long userId);
}
