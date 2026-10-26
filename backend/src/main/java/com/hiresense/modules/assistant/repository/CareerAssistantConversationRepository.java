package com.hiresense.modules.assistant.repository;

import com.hiresense.modules.assistant.model.CareerAssistantConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CareerAssistantConversationRepository extends JpaRepository<CareerAssistantConversation, Long> {
    List<CareerAssistantConversation> findByUserIdOrderByUpdatedAtDesc(Long userId);
    Optional<CareerAssistantConversation> findFirstByUserIdOrderByUpdatedAtDesc(Long userId);
    Optional<CareerAssistantConversation> findByIdAndUserId(Long id, Long userId);
}
