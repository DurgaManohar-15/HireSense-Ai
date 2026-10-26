package com.hiresense.modules.assessment.repository;

import com.hiresense.modules.assessment.model.TopicPerformanceAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopicPerformanceAnalyticsRepository extends JpaRepository<TopicPerformanceAnalytics, Long> {
    List<TopicPerformanceAnalytics> findByResultId(Long resultId);
    List<TopicPerformanceAnalytics> findByUserId(Long userId);

    @Query("SELECT t.topic, AVG(t.scorePercentage), SUM(t.totalQuestions), SUM(t.correctCount) " +
           "FROM TopicPerformanceAnalytics t WHERE t.user.id = :userId GROUP BY t.topic")
    List<Object[]> findAggregateTopicPerformanceByUserId(@Param("userId") Long userId);
}
