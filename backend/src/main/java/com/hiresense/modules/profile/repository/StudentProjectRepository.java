package com.hiresense.modules.profile.repository;

import com.hiresense.modules.profile.model.StudentProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentProjectRepository extends JpaRepository<StudentProject, Long> {
    List<StudentProject> findByProfileId(Long profileId);
}
