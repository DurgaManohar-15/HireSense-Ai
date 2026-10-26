package com.hiresense.modules.assistant.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiresense.common.exception.ResourceNotFoundException;
import com.hiresense.modules.ai.AIServiceRouter;
import com.hiresense.modules.assistant.dto.CareerAssistantDtos.*;
import com.hiresense.modules.assistant.model.CareerAssistantConversation;
import com.hiresense.modules.assistant.model.CareerAssistantMessage;
import com.hiresense.modules.assistant.repository.CareerAssistantConversationRepository;
import com.hiresense.modules.assistant.repository.CareerAssistantMessageRepository;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.intelligence.dto.PlacementReadinessDto;
import com.hiresense.modules.intelligence.dto.RoadmapDto;
import com.hiresense.modules.intelligence.dto.SkillGapDto;
import com.hiresense.modules.intelligence.service.PlacementReadinessCalculatorService;
import com.hiresense.modules.intelligence.service.RoadmapService;
import com.hiresense.modules.intelligence.service.SkillGapAnalysisService;
import com.hiresense.modules.profile.model.StudentProfile;
import com.hiresense.modules.profile.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CareerAssistantService {

    private final UserRepository userRepository;
    private final StudentProfileRepository profileRepository;
    private final PlacementReadinessCalculatorService readinessService;
    private final SkillGapAnalysisService skillGapService;
    private final RoadmapService roadmapService;
    private final CareerAssistantConversationRepository conversationRepository;
    private final CareerAssistantMessageRepository messageRepository;
    private final ObjectMapper objectMapper;
    private final AIServiceRouter aiServiceRouter;

    @Transactional
    public ChatResponse processUserMessage(Long userId, ChatRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        // 1. Resolve or Create Conversation
        CareerAssistantConversation conversation;
        if (request.getConversationId() != null) {
            conversation = conversationRepository.findByIdAndUserId(request.getConversationId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation not found or unauthorized"));
        } else {
            Optional<StudentProfile> profOpt = profileRepository.findByUserId(userId);
            conversation = CareerAssistantConversation.builder()
                    .user(user)
                    .title("Career Guidance Session")
                    .targetRole(profOpt.map(StudentProfile::getTargetRole).orElse("Software Engineer"))
                    .targetCompany(profOpt.map(p -> p.getTargetCompany() != null ? p.getTargetCompany().getName() : "General Tech").orElse("General Tech"))
                    .aiProvider("AI_ADVISOR")
                    .createdAt(Instant.now())
                    .build();
            conversation = conversationRepository.save(conversation);
        }

        // 2. Fetch Recent Conversation History for Context
        List<CareerAssistantMessage> priorMessages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());
        List<MessageDto> historyDtos = priorMessages.stream()
                .skip(Math.max(0, priorMessages.size() - 6))
                .map(m -> MessageDto.builder()
                        .senderType(m.getSenderType())
                        .messageText(m.getMessageText())
                        .build())
                .toList();

        // 3. Save User Message
        CareerAssistantMessage userMsg = CareerAssistantMessage.builder()
                .conversation(conversation)
                .senderType("USER")
                .messageText(request.getMessage().trim())
                .createdAt(Instant.now())
                .build();
        messageRepository.save(userMsg);

        // 4. Build Controlled Context Object from Real Backend Evidence
        PlacementReadinessDto readiness = readinessService.getLatestReadiness(userId);
        List<SkillGapDto> skillGaps = skillGapService.getSkillGaps(userId);
        RoadmapDto roadmap = roadmapService.getCurrentRoadmap(userId);

        List<String> topGaps = skillGaps != null ? skillGaps.stream()
                .filter(g -> g.getGapScore() > 0)
                .limit(3)
                .map(g -> g.getSkillName() + " (Gap: -" + g.getGapScore() + "%)")
                .toList() : Collections.emptyList();

        String targetRole = readiness.getTargetRole() != null ? readiness.getTargetRole() : "Software Engineer";
        String targetCompany = readiness.getTargetCompany() != null ? readiness.getTargetCompany() : "General Tech";
        int prsScore = readiness.getPrsScore() != null ? readiness.getPrsScore() : 0;
        int confidence = readiness.getConfidenceScore() != null ? readiness.getConfidenceScore() : 0;
        String bandDisplay = readiness.getReadinessBand() != null ? readiness.getReadinessBand().getDisplayName() : "Initial Stage";
        String strongest = readiness.getStrongestArea() != null ? readiness.getStrongestArea() : "Technical Foundation";
        String opportunity = readiness.getBiggestOpportunity() != null ? readiness.getBiggestOpportunity() : "Core Problem Solving";
        String roadmapStatus = roadmap != null ? (roadmap.getCompletedTasks() + "/" + roadmap.getTotalTasks() + " tasks (" + roadmap.getProgressPercentage() + "%)") : "No active roadmap";

        // 5. Generate Contextual Advisory Response via AI Service
        ChatResponse aiResult = aiServiceRouter.chatCareerAssistant(
                request.getMessage().trim(),
                targetRole,
                targetCompany,
                prsScore,
                confidence,
                bandDisplay,
                strongest,
                opportunity,
                topGaps,
                roadmapStatus,
                historyDtos
        );

        String assistantReply = aiResult.getAssistantReply();
        List<String> evidenceSources = aiResult.getEvidenceSources() != null ? aiResult.getEvidenceSources() : Collections.emptyList();
        List<String> suggestions = aiResult.getActionSuggestions() != null ? aiResult.getActionSuggestions() : Collections.emptyList();
        String aiProvider = aiResult.getAiProvider() != null ? aiResult.getAiProvider() : "AI_ADVISOR";

        // 6. Save Assistant Message
        String contextJson;
        String suggestionsJson;
        try {
            contextJson = objectMapper.writeValueAsString(evidenceSources);
            suggestionsJson = objectMapper.writeValueAsString(suggestions);
        } catch (Exception e) {
            contextJson = "[]";
            suggestionsJson = "[]";
        }

        CareerAssistantMessage assistantMsg = CareerAssistantMessage.builder()
                .conversation(conversation)
                .senderType("ASSISTANT")
                .messageText(assistantReply)
                .evidenceContextJson(contextJson)
                .actionSuggestionsJson(suggestionsJson)
                .createdAt(Instant.now())
                .build();
        messageRepository.save(assistantMsg);

        conversation.setAiProvider(aiProvider);
        conversation.setUpdatedAt(Instant.now());
        conversationRepository.save(conversation);

        return ChatResponse.builder()
                .conversationId(conversation.getId())
                .assistantReply(assistantReply)
                .evidenceSources(evidenceSources)
                .actionSuggestions(suggestions)
                .assessmentRecommendation(aiResult.getAssessmentRecommendation())
                .aiProvider(aiProvider)
                .timestamp(assistantMsg.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public ConversationDto getConversation(Long conversationId, Long userId) {
        CareerAssistantConversation conv = conversationRepository.findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found or unauthorized"));

        List<CareerAssistantMessage> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        List<MessageDto> messageDtos = messages.stream().map(m -> {
            List<String> evidence = parseJsonList(m.getEvidenceContextJson());
            List<String> suggestions = parseJsonList(m.getActionSuggestionsJson());
            return MessageDto.builder()
                    .id(m.getId())
                    .senderType(m.getSenderType())
                    .messageText(m.getMessageText())
                    .evidenceSources(evidence)
                    .actionSuggestions(suggestions)
                    .createdAt(m.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());

        return ConversationDto.builder()
                .id(conv.getId())
                .title(conv.getTitle())
                .targetRole(conv.getTargetRole())
                .targetCompany(conv.getTargetCompany())
                .aiProvider(conv.getAiProvider())
                .messages(messageDtos)
                .createdAt(conv.getCreatedAt())
                .updatedAt(conv.getUpdatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public ConversationDto getLatestOrCreateConversation(Long userId) {
        Optional<CareerAssistantConversation> latestOpt = conversationRepository.findFirstByUserIdOrderByUpdatedAtDesc(userId);
        if (latestOpt.isPresent()) {
            return getConversation(latestOpt.get().getId(), userId);
        }

        // Return empty structure with welcome assistant greeting
        return ConversationDto.builder()
                .title("Career Guidance Session")
                .messages(List.of(MessageDto.builder()
                        .senderType("ASSISTANT")
                        .messageText("Hello! I am your HireSense AI Career Assistant. Ask me about your Placement Readiness Score, biggest skill gaps, what to practice today, or how to prepare for your target company benchmark.")
                        .evidenceSources(List.of("HireSense Intelligence Engine"))
                        .actionSuggestions(List.of("What should I improve first?", "Why is my readiness score low?", "What should I study today?"))
                        .createdAt(Instant.now())
                        .build()))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    private List<String> parseJsonList(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, List.class);
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
