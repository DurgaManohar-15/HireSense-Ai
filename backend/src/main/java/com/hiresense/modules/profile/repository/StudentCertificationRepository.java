package com.hiresense.modules.profile.repository;

import com.hiresense.modules.profile.model.StudentCertification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentCertificationRepository extends JpaRepository<StudentCertification, Long> {
    List<StudentCertification> findByProfileId(Long profileId);
}
