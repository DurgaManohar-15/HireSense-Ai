package com.hiresense.modules.assessment.repository;

import com.hiresense.modules.assessment.model.DifficultyPerformanceAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DifficultyPerformanceAnalyticsRepository extends JpaRepository<DifficultyPerformanceAnalytics, Long> {
    List<DifficultyPerformanceAnalytics> findByResultId(Long resultId);
    List<DifficultyPerformanceAnalytics> findByUserId(Long userId);
}
