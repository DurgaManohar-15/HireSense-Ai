package com.hiresense.modules.assistant.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "career_assistant_messages")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareerAssistantMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private CareerAssistantConversation conversation;

    @Column(name = "sender_type", nullable = false, length = 20)
    private String senderType; // 'USER', 'ASSISTANT', 'SYSTEM'

    @Column(name = "message_text", nullable = false, columnDefinition = "LONGTEXT")
    private String messageText;

    @Column(name = "evidence_context_json", columnDefinition = "LONGTEXT")
    private String evidenceContextJson;

    @Column(name = "action_suggestions_json", columnDefinition = "LONGTEXT")
    private String actionSuggestionsJson;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
