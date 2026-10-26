package com.hiresense.modules.interview.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiresense.modules.auth.dto.AuthResponse;
import com.hiresense.modules.auth.dto.RegisterRequest;
import com.hiresense.modules.auth.service.AuthService;
import com.hiresense.modules.interview.dto.StartInterviewRequest;
import com.hiresense.modules.interview.dto.SubmitAnswerRequest;
import com.hiresense.modules.interview.model.InterviewDifficulty;
import com.hiresense.modules.interview.model.InterviewType;
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
class InterviewControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthService authService;

    private String studentAToken;
    private String studentBToken;

    @BeforeEach
    void setUp() {
        org.springframework.security.core.context.SecurityContextHolder.clearContext();

        // 1. Register Student A
        String emailA = "student.int.a." + System.currentTimeMillis() + "@hiresense.ai";
        AuthResponse authA = authService.register(RegisterRequest.builder()
                .email(emailA)
                .password("Password@123")
                .firstName("Interview")
                .lastName("StudentA")
                .build());
        studentAToken = authA.getAccessToken();

        // 2. Register Student B
        String emailB = "student.int.b." + System.currentTimeMillis() + "@hiresense.ai";
        AuthResponse authB = authService.register(RegisterRequest.builder()
                .email(emailB)
                .password("Password@123")
                .firstName("Interview")
                .lastName("StudentB")
                .build());
        studentBToken = authB.getAccessToken();
    }

    @Test
    @DisplayName("Integration: Full Mock Interview Lifecycle (Start -> Turn 1 -> Turn 2 -> Complete -> Final Report -> IDOR Check)")
    void testFullInterviewLifecycle() throws Exception {
        // 1. Start Interview (Technical, 2 questions)
        StartInterviewRequest startReq = StartInterviewRequest.builder()
                .interviewType(InterviewType.TECHNICAL)
                .difficulty(InterviewDifficulty.ADAPTIVE)
                .targetRole("Backend Engineer")
                .targetCompany("Google")
                .totalQuestions(2)
                .build();

        MvcResult startResult = mockMvc.perform(post("/api/v1/interviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(startReq))
                        .header("Authorization", "Bearer " + studentAToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("IN_PROGRESS")))
                .andExpect(jsonPath("$.data.currentQuestion.sequenceNumber", is(1)))
                .andReturn();

        Long interviewId = objectMapper.readTree(startResult.getResponse().getContentAsString()).get("data").get("id").asLong();
        Long question1Id = objectMapper.readTree(startResult.getResponse().getContentAsString()).get("data").get("currentQuestion").get("id").asLong();

        // 2. Get Active Session
        mockMvc.perform(get("/api/v1/interviews/" + interviewId)
                        .header("Authorization", "Bearer " + studentAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id", is(interviewId.intValue())));

        // 3. Submit Answer 1
        SubmitAnswerRequest ans1 = SubmitAnswerRequest.builder()
                .questionId(question1Id)
                .answerText("Object-oriented programming utilizes encapsulation to safeguard internal state, while polymorphism allows unified interfaces for diverse underlying types.")
                .timeTakenSeconds(40)
                .build();

        MvcResult turn1Result = mockMvc.perform(post("/api/v1/interviews/" + interviewId + "/answers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ans1))
                        .header("Authorization", "Bearer " + studentAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.finished", is(false)))
                .andExpect(jsonPath("$.data.turnEvaluation.overallTurnScore", greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.data.nextQuestion.sequenceNumber", is(2)))
                .andReturn();

        Long question2Id = objectMapper.readTree(turn1Result.getResponse().getContentAsString()).get("data").get("nextQuestion").get("id").asLong();

        // 4. Submit Answer 2 (Last Question)
        SubmitAnswerRequest ans2 = SubmitAnswerRequest.builder()
                .questionId(question2Id)
                .answerText("B-Tree indexing speeds up searches by keeping keys sorted in a self-balancing tree, allowing O(log N) lookups at the expense of write overhead.")
                .timeTakenSeconds(45)
                .build();

        mockMvc.perform(post("/api/v1/interviews/" + interviewId + "/answers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ans2))
                        .header("Authorization", "Bearer " + studentAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.finished", is(true)));

        // 5. Retrieve Final Report
        mockMvc.perform(get("/api/v1/interviews/" + interviewId + "/report")
                        .header("Authorization", "Bearer " + studentAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.overallScore", greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.data.turnReviews", hasSize(2)));

        // 6. Retrieve History
        mockMvc.perform(get("/api/v1/interviews/history")
                        .header("Authorization", "Bearer " + studentAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)));

        // 7. Security IDOR Check: Student B cannot access Student A's interview or final report
        mockMvc.perform(get("/api/v1/interviews/" + interviewId)
                        .header("Authorization", "Bearer " + studentBToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/interviews/" + interviewId + "/report")
                        .header("Authorization", "Bearer " + studentBToken))
                .andExpect(status().isNotFound());

        // 8. Security Guard: Submitting to completed interview returns 400 Bad Request
        mockMvc.perform(post("/api/v1/interviews/" + interviewId + "/answers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ans2))
                        .header("Authorization", "Bearer " + studentAToken))
                .andExpect(status().isBadRequest());
    }
}
