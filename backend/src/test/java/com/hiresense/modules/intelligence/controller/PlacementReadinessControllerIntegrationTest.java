package com.hiresense.modules.intelligence.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiresense.modules.auth.dto.AuthResponse;
import com.hiresense.modules.auth.dto.LoginRequest;
import com.hiresense.modules.auth.dto.RegisterRequest;
import com.hiresense.modules.auth.service.AuthService;
import com.hiresense.modules.intelligence.dto.GenerateRoadmapRequest;
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
class PlacementReadinessControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthService authService;

    private String studentToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        org.springframework.security.core.context.SecurityContextHolder.clearContext();

        // 1. Register Student
        String studentEmail = "student.intel." + System.currentTimeMillis() + "@hiresense.ai";
        AuthResponse studentAuth = authService.register(RegisterRequest.builder()
                .email(studentEmail)
                .password("Password@123")
                .firstName("Intel")
                .lastName("Student")
                .build());
        studentToken = studentAuth.getAccessToken();

        // 2. Login Admin
        AuthResponse adminAuth = authService.login(LoginRequest.builder()
                .email("admin@hiresense.ai")
                .password("Admin@HireSense2026")
                .build());
        adminToken = adminAuth.getAccessToken();
    }

    @Test
    @DisplayName("Integration: Full Placement Readiness, Skill Gaps, Roadmap, and Research Analytics Flow")
    void testFullReadinessIntelligenceLifecycle() throws Exception {
        // 1. Calculate & Fetch Latest Placement Readiness Score (PRS)
        mockMvc.perform(get("/api/v1/readiness")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.scoringVersion", is("PRS_v1.0.0")))
                .andExpect(jsonPath("$.data.prsScore", notNullValue()))
                .andExpect(jsonPath("$.data.confidenceScore", notNullValue()));

        // 2. Recalculate PRS
        mockMvc.perform(post("/api/v1/readiness/recalculate")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.prsScore", notNullValue()));

        // 3. Fetch Skill Gaps
        mockMvc.perform(get("/api/v1/skill-gaps")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", notNullValue()));

        // 4. Generate Personalized 14-Day Roadmap
        GenerateRoadmapRequest roadmapReq = GenerateRoadmapRequest.builder()
                .durationDays(14)
                .hoursPerDay(2)
                .targetRole("Backend Engineer")
                .targetCompany("Google")
                .build();

        MvcResult roadmapResult = mockMvc.perform(post("/api/v1/roadmaps/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(roadmapReq))
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.durationDays", is(14)))
                .andExpect(jsonPath("$.data.tasks", hasSize(14)))
                .andReturn();

        Long taskId = objectMapper.readTree(roadmapResult.getResponse().getContentAsString())
                .get("data").get("tasks").get(0).get("id").asLong();

        // 5. Update Roadmap Task Completion Status
        mockMvc.perform(put("/api/v1/roadmaps/tasks/" + taskId + "/status?completed=true")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.completed", is(true)));

        // 6. Security: Student forbidden from accessing Admin Research metrics (403)
        mockMvc.perform(get("/api/v1/admin/research/cohort-metrics")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        // 7. Admin can access Cohort Research Metrics & Export CSV
        mockMvc.perform(get("/api/v1/admin/research/cohort-metrics")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalStudents", greaterThanOrEqualTo(1)));

        mockMvc.perform(get("/api/v1/admin/research/export-csv")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", notNullValue()));
    }
}
