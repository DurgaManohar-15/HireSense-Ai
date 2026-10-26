package com.hiresense.modules.profile.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiresense.modules.auth.dto.AuthResponse;
import com.hiresense.modules.auth.dto.RegisterRequest;
import com.hiresense.modules.auth.service.AuthService;
import com.hiresense.modules.profile.dto.SkillDto;
import com.hiresense.modules.profile.dto.StudentProfileRequest;
import com.hiresense.modules.profile.model.SkillProficiency;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Collections;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class StudentProfileControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthService authService;

    private String jwtToken;

    @BeforeEach
    void setUp() {
        String uniqueEmail = "profile.test." + System.currentTimeMillis() + "@hiresense.ai";
        RegisterRequest registerReq = RegisterRequest.builder()
                .email(uniqueEmail)
                .password("Password@123")
                .firstName("Test")
                .lastName("Student")
                .build();

        AuthResponse authResponse = authService.register(registerReq);
        jwtToken = authResponse.getAccessToken();
    }

    @Test
    @DisplayName("Integration: Unauthenticated access to /api/v1/profile/me returns 401")
    void testGetProfileUnauthenticatedReturns401() throws Exception {
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
        mockMvc.perform(get("/api/v1/profile/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Integration: Update profile and fetch updated profile with JWT")
    void testCreateAndUpdateProfile() throws Exception {
        StudentProfileRequest profileRequest = StudentProfileRequest.builder()
                .firstName("Test")
                .lastName("Student")
                .collegeName("National Institute of Technology")
                .degree("B.Tech")
                .branch("Computer Science")
                .graduationYear(2026)
                .cgpa(new BigDecimal("9.20"))
                .targetRole("Backend Engineer")
                .targetTimelineWeeks(16)
                .skills(Collections.singletonList(
                        SkillDto.builder().name("Java").category("PROGRAMMING_LANGUAGE").proficiencyLevel(SkillProficiency.ADVANCED).build()
                ))
                .build();

        // 1. Update Profile
        mockMvc.perform(put("/api/v1/profile/me")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profileRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.collegeName", is("National Institute of Technology")))
                .andExpect(jsonPath("$.data.targetRole", is("Backend Engineer")));

        // 2. Retrieve Profile
        mockMvc.perform(get("/api/v1/profile/me")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.degree", is("B.Tech")))
                .andExpect(jsonPath("$.data.skills[0].name", is("Java")));
    }
}
