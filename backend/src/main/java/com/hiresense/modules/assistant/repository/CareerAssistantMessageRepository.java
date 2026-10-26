package com.hiresense.modules.assistant.repository;

import com.hiresense.modules.assistant.model.CareerAssistantMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareerAssistantMessageRepository extends JpaRepository<CareerAssistantMessage, Long> {
    List<CareerAssistantMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
}
