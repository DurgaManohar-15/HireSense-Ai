package com.hiresense.modules.resumebuilder.repository;

import com.hiresense.modules.resumebuilder.model.ResumeVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeVersionRepository extends JpaRepository<ResumeVersion, Long> {
    List<ResumeVersion> findByUserIdOrderByUpdatedAtDesc(Long userId);
    Optional<ResumeVersion> findByIdAndUserId(Long id, Long userId);
    Optional<ResumeVersion> findByUserIdAndMasterTrue(Long userId);
    long countByUserId(Long userId);
}
