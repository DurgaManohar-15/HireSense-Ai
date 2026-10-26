package com.hiresense.modules.assessment.repository;

import com.hiresense.modules.assessment.model.StudentResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentResponseRepository extends JpaRepository<StudentResponse, Long> {
    List<StudentResponse> findBySessionId(Long sessionId);
    Optional<StudentResponse> findBySessionIdAndQuestionId(Long sessionId, Long questionId);
}
