package com.hiresense.modules.profile.repository;

import com.hiresense.modules.profile.model.TargetCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TargetCompanyRepository extends JpaRepository<TargetCompany, Long> {
    Optional<TargetCompany> findByNameIgnoreCase(String name);
    List<TargetCompany> findByActiveTrue();
}
