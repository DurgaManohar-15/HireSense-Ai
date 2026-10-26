package com.hiresense.modules.resume.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiresense.modules.auth.dto.AuthResponse;
import com.hiresense.modules.auth.dto.RegisterRequest;
import com.hiresense.modules.auth.service.AuthService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.io.ByteArrayOutputStream;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ResumeControllerIntegrationTest {

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
        String emailA = "student.res.a." + System.currentTimeMillis() + "@hiresense.ai";
        AuthResponse authA = authService.register(RegisterRequest.builder()
                .email(emailA)
                .password("Password@123")
                .firstName("Resume")
                .lastName("StudentA")
                .build());
        studentAToken = authA.getAccessToken();

        // 2. Register Student B
        String emailB = "student.res.b." + System.currentTimeMillis() + "@hiresense.ai";
        AuthResponse authB = authService.register(RegisterRequest.builder()
                .email(emailB)
                .password("Password@123")
                .firstName("Resume")
                .lastName("StudentB")
                .build());
        studentBToken = authB.getAccessToken();
    }

    private byte[] createValidPdfBytes() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 12);
                cs.newLineAtOffset(50, 700);
                cs.showText("John Student - Software Engineer Resume with Java, Spring Boot, MySQL, Git, Docker, and React.");
                cs.newLineAtOffset(0, -20);
                cs.showText("Education: B.Tech Computer Science Engineering with 8.9 CGPA. Academic Projects: HireSense Platform.");
                cs.endText();
            }
            doc.save(baos);
        }
        return baos.toByteArray();
    }

    @Test
    @DisplayName("Integration: Full Resume Lifecycle (Upload -> List -> Analyze -> Review -> IDOR Check)")
    void testResumeUploadAndAnalysisFlow() throws Exception {
        byte[] pdfBytes = createValidPdfBytes();

        MockMultipartFile validPdf = new MockMultipartFile(
                "file", "John_Resume.pdf", "application/pdf", pdfBytes
        );

        // 1. Upload Resume
        MvcResult uploadResult = mockMvc.perform(multipart("/api/v1/resumes")
                        .file(validPdf)
                        .header("Authorization", "Bearer " + studentAToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.originalFilename", is("John_Resume.pdf")))
                .andExpect(jsonPath("$.data.versionNumber", is(1)))
                .andReturn();

        Long resumeId = objectMapper.readTree(uploadResult.getResponse().getContentAsString()).get("data").get("id").asLong();

        // 2. List Resumes
        mockMvc.perform(get("/api/v1/resumes")
                        .header("Authorization", "Bearer " + studentAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)));

        // 3. Trigger AI Resume Analysis
        MvcResult analysisResult = mockMvc.perform(post("/api/v1/resumes/" + resumeId + "/analyze")
                        .header("Authorization", "Bearer " + studentAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.overallScore", greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.data.overallScore", lessThanOrEqualTo(100)))
                .andExpect(jsonPath("$.data.analysis.extractedSkills", hasItem("Java")))
                .andReturn();

        // 4. Retrieve Analysis
        mockMvc.perform(get("/api/v1/resumes/" + resumeId + "/analysis")
                        .header("Authorization", "Bearer " + studentAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.overallScore", notNullValue()));

        // 5. Security IDOR Check: Student B cannot access Student A's resume or analysis
        mockMvc.perform(get("/api/v1/resumes/" + resumeId)
                        .header("Authorization", "Bearer " + studentBToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/resumes/" + resumeId + "/analysis")
                        .header("Authorization", "Bearer " + studentBToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Upload non-PDF or fake PDF should be rejected with 400 Bad Request")
    void testUploadInvalidFileRejected() throws Exception {
        MockMultipartFile textFile = new MockMultipartFile(
                "file", "malicious.txt", "text/plain", "This is plain text pretending to be a PDF".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/resumes")
                        .file(textFile)
                        .header("Authorization", "Bearer " + studentAToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));
    }
}
