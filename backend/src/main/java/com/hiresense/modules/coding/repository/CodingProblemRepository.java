package com.hiresense.modules.coding.repository;

import com.hiresense.modules.coding.model.CodingProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CodingProblemRepository extends JpaRepository<CodingProblem, Long> {
    Optional<CodingProblem> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<CodingProblem> findByDifficulty(String difficulty);
    List<CodingProblem> findByTopic(String topic);
}
