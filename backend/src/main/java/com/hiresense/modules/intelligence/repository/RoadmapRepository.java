package com.hiresense.modules.intelligence.repository;

import com.hiresense.modules.intelligence.model.Roadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoadmapRepository extends JpaRepository<Roadmap, Long> {
    Optional<Roadmap> findFirstByUserIdAndActiveTrueOrderByVersionNumberDesc(Long userId);
    List<Roadmap> findByUserIdOrderByVersionNumberDesc(Long userId);
    Optional<Roadmap> findByIdAndUserId(Long id, Long userId);
}
