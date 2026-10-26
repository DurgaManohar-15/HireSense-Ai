package com.hiresense.modules.profile.repository;

import com.hiresense.modules.profile.model.StudentSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentSkillRepository extends JpaRepository<StudentSkill, Long> {
    List<StudentSkill> findByProfileId(Long profileId);
    void deleteByProfileId(Long profileId);
}
