package com.hiresense.modules.intelligence.repository;

import com.hiresense.modules.intelligence.model.PlacementReadinessSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlacementReadinessSnapshotRepository extends JpaRepository<PlacementReadinessSnapshot, Long> {
    List<PlacementReadinessSnapshot> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<PlacementReadinessSnapshot> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<PlacementReadinessSnapshot> findFirstByUserIdOrderByCreatedAtAsc(Long userId);
    Optional<PlacementReadinessSnapshot> findByIdAndUserId(Long id, Long userId);
}
