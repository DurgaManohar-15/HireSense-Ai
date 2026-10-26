package com.hiresense.modules.assessment.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiresense.modules.assessment.dto.SaveAnswerRequest;
import com.hiresense.modules.assessment.dto.StartAssessmentRequest;
import com.hiresense.modules.assessment.model.AssessmentCategory;
import com.hiresense.modules.assessment.model.AssessmentDefinition;
import com.hiresense.modules.assessment.model.Question;
import com.hiresense.modules.assessment.model.QuestionOption;
import com.hiresense.modules.assessment.repository.AssessmentDefinitionRepository;
import com.hiresense.modules.assessment.repository.QuestionOptionRepository;
import com.hiresense.modules.assessment.repository.QuestionRepository;
import com.hiresense.modules.auth.dto.AuthResponse;
import com.hiresense.modules.auth.dto.RegisterRequest;
import com.hiresense.modules.auth.service.AuthService;
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

import java.math.BigDecimal;
import java.util.ArrayList;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AssessmentControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthService authService;

    @Autowired
    private AssessmentDefinitionRepository definitionRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private QuestionOptionRepository optionRepository;

    private String studentAToken;
    private String studentBToken;
    private AssessmentDefinition sampleAssessment;
    private Question sampleQuestion;
    private QuestionOption correctOption;

    @BeforeEach
    void setUp() {
        org.springframework.security.core.context.SecurityContextHolder.clearContext();

        // 1. Register Student A
        String emailA = "student.a." + System.currentTimeMillis() + "@hiresense.ai";
        AuthResponse authA = authService.register(RegisterRequest.builder()
                .email(emailA)
                .password("Password@123")
                .firstName("Student")
                .lastName("A")
                .build());
        studentAToken = authA.getAccessToken();

        // 2. Register Student B
        String emailB = "student.b." + System.currentTimeMillis() + "@hiresense.ai";
        AuthResponse authB = authService.register(RegisterRequest.builder()
                .email(emailB)
                .password("Password@123")
                .firstName("Student")
                .lastName("B")
                .build());
        studentBToken = authB.getAccessToken();

        // 3. Seed test assessment & question
        sampleAssessment = definitionRepository.save(AssessmentDefinition.builder()
                .title("Integration Test Assessment")
                .slug("integration-test-assessment-" + System.currentTimeMillis())
                .description("Integration test assessment definition")
                .category(AssessmentCategory.CORE_CS_TECHNICAL)
                .durationMinutes(15)
                .totalQuestions(1)
                .passingPercentage(new BigDecimal("60.00"))
                .active(true)
                .build());

        sampleQuestion = questionRepository.save(Question.builder()
                .category(AssessmentCategory.CORE_CS_TECHNICAL)
                .topic("Java Core")
                .questionText("Which keyword prevents method overriding in Java?")
                .explanation("The final keyword prevents a method from being overridden.")
                .marks(1)
                .active(true)
                .options(new ArrayList<>())
                .build());

        correctOption = optionRepository.save(QuestionOption.builder()
                .question(sampleQuestion)
                .optionLabel("A")
                .optionText("final")
                .correct(true)
                .build());

        optionRepository.save(QuestionOption.builder()
                .question(sampleQuestion)
                .optionLabel("B")
                .optionText("static")
                .correct(false)
                .build());
    }

    @Test
    @DisplayName("Integration: Full Assessment Flow (List -> Start -> Save Answer -> Submit -> Review Result)")
    void testCompleteAssessmentFlow() throws Exception {
        // 1. List Available Assessments
        mockMvc.perform(get("/api/v1/assessments")
                        .header("Authorization", "Bearer " + studentAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", not(empty())));

        // 2. Start Assessment Session
        StartAssessmentRequest startReq = StartAssessmentRequest.builder()
                .assessmentDefinitionId(sampleAssessment.getId())
                .build();

        MvcResult startResult = mockMvc.perform(post("/api/v1/assessments/" + sampleAssessment.getId() + "/start")
                        .header("Authorization", "Bearer " + studentAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(startReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("IN_PROGRESS")))
                .andExpect(jsonPath("$.data.questions[0].options[0].correct").doesNotExist()) // Verify answer key is completely omitted
                .andReturn();

        String responseJson = startResult.getResponse().getContentAsString();
        Long sessionId = objectMapper.readTree(responseJson).get("data").get("id").asLong();

        // 3. Save Answer (Correct Option)
        SaveAnswerRequest saveReq = SaveAnswerRequest.builder()
                .questionId(sampleQuestion.getId())
                .selectedOptionId(correctOption.getId())
                .markedForReview(false)
                .build();

        mockMvc.perform(post("/api/v1/assessment-sessions/" + sessionId + "/responses")
                        .header("Authorization", "Bearer " + studentAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(saveReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // 4. Submit Assessment Session
        MvcResult submitResult = mockMvc.perform(post("/api/v1/assessment-sessions/" + sessionId + "/submit")
                        .header("Authorization", "Bearer " + studentAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.correctCount", is(1)))
                .andExpect(jsonPath("$.data.scorePercentage", is(100.0)))
                .andExpect(jsonPath("$.data.passed", is(true)))
                .andExpect(jsonPath("$.data.topicPerformance[0].topic", is("Java Core")))
                .andReturn();

        String submitJson = submitResult.getResponse().getContentAsString();
        Long resultId = objectMapper.readTree(submitJson).get("data").get("id").asLong();

        // 5. Fetch Result Details (Review Mode discloses answers)
        mockMvc.perform(get("/api/v1/assessment-results/" + resultId)
                        .header("Authorization", "Bearer " + studentAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.questionReviews[0].correct", is(true)))
                .andExpect(jsonPath("$.data.questionReviews[0].explanation", containsString("final keyword")));

        // 6. Security IDOR Check: Student B attempting to access Student A's result must fail (404/403)
        mockMvc.perform(get("/api/v1/assessment-results/" + resultId)
                        .header("Authorization", "Bearer " + studentBToken))
                .andExpect(status().isNotFound());
    }
}
