package com.hiresense.modules.assessment.repository;

import com.hiresense.modules.assessment.model.AssessmentCategory;
import com.hiresense.modules.assessment.model.AssessmentDifficulty;
import com.hiresense.modules.assessment.model.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByCategoryAndActiveTrue(AssessmentCategory category);
    List<Question> findByActiveTrue();
    
    @Query("SELECT q FROM Question q WHERE q.active = true AND (:category IS NULL OR q.category = :category) AND (:topic IS NULL OR LOWER(q.topic) = LOWER(:topic)) AND (:difficulty IS NULL OR q.difficulty = :difficulty)")
    Page<Question> findWithFilters(
            @Param("category") AssessmentCategory category,
            @Param("topic") String topic,
            @Param("difficulty") AssessmentDifficulty difficulty,
            Pageable pageable
    );

    @Query("SELECT DISTINCT q.topic FROM Question q WHERE q.active = true AND q.category = :category")
    List<String> findDistinctTopicsByCategory(@Param("category") AssessmentCategory category);

    @Query("SELECT DISTINCT q.topic FROM Question q WHERE q.active = true ORDER BY q.topic ASC")
    List<String> findAllDistinctActiveTopics();

    @Query("SELECT q FROM Question q WHERE q.active = true AND LOWER(q.topic) IN :topics AND (:difficulty IS NULL OR q.difficulty = :difficulty)")
    List<Question> findByTopicsAndDifficulty(
            @Param("topics") List<String> topics,
            @Param("difficulty") AssessmentDifficulty difficulty
    );

    @Query("SELECT q FROM Question q WHERE q.active = true AND LOWER(q.topic) IN :topics")
    List<Question> findByTopics(@Param("topics") List<String> topics);

    @Query("SELECT q.topic, q.category, q.difficulty, COUNT(q) FROM Question q WHERE q.active = true GROUP BY q.topic, q.category, q.difficulty ORDER BY q.topic ASC")
    List<Object[]> findTopicDifficultyCounts();

    @Query("SELECT DISTINCT q FROM Question q LEFT JOIN FETCH q.options WHERE q.active = true")
    List<Question> findAllWithFullOptions();
}
