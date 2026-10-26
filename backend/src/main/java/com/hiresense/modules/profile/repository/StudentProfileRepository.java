package com.hiresense.modules.profile.repository;

import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.profile.model.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUser(User user);
    Optional<StudentProfile> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
