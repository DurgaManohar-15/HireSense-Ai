package com.hiresense.modules.assessment.repository;

import com.hiresense.modules.assessment.model.AssessmentCategory;
import com.hiresense.modules.assessment.model.AssessmentDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentDefinitionRepository extends JpaRepository<AssessmentDefinition, Long> {
    List<AssessmentDefinition> findByActiveTrue();
    List<AssessmentDefinition> findByCategoryAndActiveTrue(AssessmentCategory category);
    Optional<AssessmentDefinition> findBySlug(String slug);
}
