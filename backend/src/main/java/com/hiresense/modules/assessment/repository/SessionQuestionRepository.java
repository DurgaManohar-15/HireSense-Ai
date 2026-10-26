package com.hiresense.modules.assessment.repository;

import com.hiresense.modules.assessment.model.SessionQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionQuestionRepository extends JpaRepository<SessionQuestion, Long> {
    List<SessionQuestion> findBySessionIdOrderByQuestionOrderAsc(Long sessionId);
}
