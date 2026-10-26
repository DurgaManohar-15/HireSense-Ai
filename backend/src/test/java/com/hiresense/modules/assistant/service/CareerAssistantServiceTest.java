package com.hiresense.modules.assistant.service;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import com.hiresense.modules.intelligence.model.ReadinessBand;
import com.hiresense.modules.intelligence.service.PlacementReadinessCalculatorService;
import com.hiresense.modules.intelligence.service.RoadmapService;
import com.hiresense.modules.intelligence.service.SkillGapAnalysisService;
import com.hiresense.modules.profile.repository.StudentProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CareerAssistantServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private StudentProfileRepository profileRepository;
    @Mock
    private PlacementReadinessCalculatorService readinessService;
    @Mock
    private SkillGapAnalysisService skillGapService;
    @Mock
    private RoadmapService roadmapService;
    @Mock
    private CareerAssistantConversationRepository conversationRepository;
    @Mock
    private CareerAssistantMessageRepository messageRepository;
    @Mock
    private com.hiresense.modules.ai.AIServiceRouter aiServiceRouter;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private CareerAssistantService careerAssistantService;

    private User user;
    private PlacementReadinessDto sampleReadiness;
    private RoadmapDto sampleRoadmap;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("student@hiresense.ai").firstName("Jane").build();

        sampleReadiness = PlacementReadinessDto.builder()
                .prsScore(78)
                .confidenceScore(82)
                .readinessBand(ReadinessBand.GOOD)
                .targetRole("Backend Engineer")
                .targetCompany("Amazon")
                .strongestArea("Java OOP")
                .biggestOpportunity("DBMS Indexing")
                .availableEvidenceCount(4)
                .build();

        sampleRoadmap = RoadmapDto.builder()
                .id(10L)
                .durationDays(30)
                .totalTasks(30)
                .completedTasks(12)
                .progressPercentage(40)
                .targetRole("Backend Engineer")
                .build();
    }

    @Test
    @DisplayName("Should generate contextual guidance using real PRS, skill gap, and roadmap data")
    void testProcessUserMessageContextual() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(readinessService.getLatestReadiness(1L)).thenReturn(sampleReadiness);
        when(skillGapService.getSkillGaps(1L)).thenReturn(List.of(
                SkillGapDto.builder().skillName("DBMS Indexing").gapScore(20).build()
        ));
        when(roadmapService.getCurrentRoadmap(1L)).thenReturn(sampleRoadmap);

        when(conversationRepository.save(any(CareerAssistantConversation.class)))
                .thenAnswer(inv -> {
                    CareerAssistantConversation c = inv.getArgument(0);
                    c.setId(100L);
                    return c;
                });
        when(messageRepository.save(any(CareerAssistantMessage.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        when(aiServiceRouter.chatCareerAssistant(any(), any(), any(), anyInt(), anyInt(), any(), any(), any(), any(), any(), any()))
                .thenReturn(ChatResponse.builder()
                        .assistantReply("Based on your latest Placement Readiness Score of 78/100 (Good), your primary improvement focus should be in DBMS Indexing.")
                        .evidenceSources(List.of("Skill Gap Engine", "Company Benchmark Comparison"))
                        .actionSuggestions(List.of("Complete today's assigned tasks in your Preparation Roadmap."))
                        .aiProvider("MOCK_DETERMINISTIC")
                        .build());

        ChatRequest request = ChatRequest.builder()
                .message("What should I improve first to prepare for Amazon?")
                .build();

        ChatResponse response = careerAssistantService.processUserMessage(1L, request);

        assertNotNull(response);
        assertNotNull(response.getAssistantReply());
        assertTrue(response.getAssistantReply().contains("78/100"));
        assertTrue(response.getAssistantReply().contains("DBMS Indexing"));
        assertFalse(response.getEvidenceSources().isEmpty());
        assertFalse(response.getActionSuggestions().isEmpty());
        verify(messageRepository, times(2)).save(any(CareerAssistantMessage.class)); // 1 User + 1 Assistant
    }
}
