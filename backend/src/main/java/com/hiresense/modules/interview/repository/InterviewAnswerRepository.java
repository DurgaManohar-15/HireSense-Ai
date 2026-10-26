package com.hiresense.modules.interview.repository;

import com.hiresense.modules.interview.model.InterviewAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewAnswerRepository extends JpaRepository<InterviewAnswer, Long> {
    Optional<InterviewAnswer> findByInterviewIdAndQuestionId(Long interviewId, Long questionId);
    List<InterviewAnswer> findByInterviewId(Long interviewId);
}
