package com.hiresense.modules.platform.repository;

import com.hiresense.modules.platform.model.TargetRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TargetRoleRepository extends JpaRepository<TargetRole, Long> {
    List<TargetRole> findByActiveTrueOrderByNameAsc();
    Optional<TargetRole> findByNameIgnoreCase(String name);
}
