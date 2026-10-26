package com.hiresense.modules.intelligence.repository;

import com.hiresense.modules.intelligence.model.RoadmapTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoadmapTaskRepository extends JpaRepository<RoadmapTask, Long> {
    List<RoadmapTask> findByRoadmapIdOrderByDayNumberAsc(Long roadmapId);
    Optional<RoadmapTask> findByIdAndRoadmapUserId(Long id, Long userId);
}
