package com.hiresense.modules.resume.repository;

import com.hiresense.modules.resume.model.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    Optional<Resume> findByIdAndUserId(Long id, Long userId);
    List<Resume> findByUserIdOrderByVersionNumberDesc(Long userId);
    Optional<Resume> findFirstByUserIdAndActiveTrueOrderByVersionNumberDesc(Long userId);
    Optional<Resume> findFirstByUserIdAndFileHashSha256(Long userId, String fileHashSha256);
    long countByUserId(Long userId);
}
