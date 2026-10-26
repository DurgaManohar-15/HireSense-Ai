package com.hiresense.modules.platform.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiresense.modules.assistant.dto.CareerAssistantDtos.*;
import com.hiresense.modules.auth.dto.AuthResponse;
import com.hiresense.modules.auth.dto.LoginRequest;
import com.hiresense.modules.auth.dto.RegisterRequest;
import com.hiresense.modules.auth.service.AuthService;
import com.hiresense.modules.platform.dto.CreateAnnouncementRequest;
import com.hiresense.modules.platform.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PlatformControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthService authService;

    @Autowired
    private NotificationService notificationService;

    private String studentToken;
    private Long studentId;
    private String adminToken;

    @BeforeEach
    void setUp() {
        org.springframework.security.core.context.SecurityContextHolder.clearContext();

        // 1. Register Student
        String studentEmail = "student.platform." + System.currentTimeMillis() + "@hiresense.ai";
        AuthResponse studentAuth = authService.register(RegisterRequest.builder()
                .email(studentEmail)
                .password("Password@123")
                .firstName("Platform")
                .lastName("Student")
                .build());
        studentToken = studentAuth.getAccessToken();
        studentId = studentAuth.getUser().getId();

        // 2. Login Admin
        AuthResponse adminAuth = authService.login(LoginRequest.builder()
                .email("admin@hiresense.ai")
                .password("Admin@HireSense2026")
                .build());
        adminToken = adminAuth.getAccessToken();
    }

    @Test
    @DisplayName("Integration: Full Phase 6 Platform, Dashboard, Career Assistant, Notifications, Announcements & Admin Flow")
    void testFullPlatformLifecycle() throws Exception {
        // 1. Unified Student Dashboard
        mockMvc.perform(get("/api/v1/dashboard/student")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.readiness", notNullValue()))
                .andExpect(jsonPath("$.data.recentActivityFeed", notNullValue()));

        // 2. In-App Notifications
        notificationService.createNotification(studentId, "Assessment Ready", "Diagnostic Quantitative MCQ is waiting", "ASSESSMENT", "/assessments");

        mockMvc.perform(get("/api/v1/notifications")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));

        mockMvc.perform(get("/api/v1/notifications/unread-count")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.unreadCount", greaterThanOrEqualTo(1)));

        // 3. Admin creates broadcast announcement
        CreateAnnouncementRequest annReq = CreateAnnouncementRequest.builder()
                .title("Campus Placement Drive Registration")
                .content("Tier 1 company registrations open on the portal.")
                .targetAudience("ALL_STUDENTS")
                .priority("HIGH")
                .build();

        mockMvc.perform(post("/api/v1/announcements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(annReq))
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.title", is("Campus Placement Drive Registration")));

        // Student fetches active announcements
        mockMvc.perform(get("/api/v1/announcements")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));

        // 4. AI Career Assistant Chat
        ChatRequest chatReq = ChatRequest.builder()
                .message("What should I improve first to maximize my readiness score?")
                .build();

        mockMvc.perform(post("/api/v1/career-assistant/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(chatReq))
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.assistantReply", notNullValue()))
                .andExpect(jsonPath("$.data.evidenceSources", notNullValue()));

        // Fetch current conversation
        mockMvc.perform(get("/api/v1/career-assistant/conversation")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.messages", hasSize(greaterThanOrEqualTo(2))));

        // 5. Admin Student Management & Cohort Analytics
        mockMvc.perform(get("/api/v1/admin/students")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))));

        mockMvc.perform(get("/api/v1/admin/students/cohort-analytics")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalStudents", greaterThanOrEqualTo(1)));

        // 6. Security: Student forbidden from admin endpoints (403)
        mockMvc.perform(get("/api/v1/admin/students")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }
}
