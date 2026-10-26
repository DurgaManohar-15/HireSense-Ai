package com.hiresense.modules.interview.repository;

import com.hiresense.modules.interview.model.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {
    List<InterviewQuestion> findByInterviewIdOrderBySequenceNumberAsc(Long interviewId);
    Optional<InterviewQuestion> findByInterviewIdAndSequenceNumber(Long interviewId, Integer sequenceNumber);
}
