package com.hiresense.modules.interview.repository;

import com.hiresense.modules.interview.model.InterviewTurnEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewTurnEvaluationRepository extends JpaRepository<InterviewTurnEvaluation, Long> {
    Optional<InterviewTurnEvaluation> findByAnswerId(Long answerId);
    List<InterviewTurnEvaluation> findByInterviewIdOrderByQuestionIdAsc(Long interviewId);
}
