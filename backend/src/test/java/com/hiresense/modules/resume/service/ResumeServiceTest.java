package com.hiresense.modules.resume.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiresense.common.exception.ResourceNotFoundException;
import com.hiresense.modules.ai.AIService;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.intelligence.service.PlacementReadinessCalculatorService;
import com.hiresense.modules.intelligence.service.SkillGapAnalysisService;
import com.hiresense.modules.profile.repository.StudentProfileRepository;
import com.hiresense.modules.resume.dto.ResumeAnalysisResponse;
import com.hiresense.modules.resume.dto.ResumeAnalysisResultDto;
import com.hiresense.modules.resume.dto.ResumeDto;
import com.hiresense.modules.resume.model.JdResumeAnalysis;
import com.hiresense.modules.resume.model.Resume;
import com.hiresense.modules.resume.model.ResumeAnalysis;
import com.hiresense.modules.resume.repository.*;
import com.hiresense.modules.resume.storage.ResumeStorageService;
import com.hiresense.modules.resume.util.PiiSanitizer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResumeServiceTest {

    @Mock
    private ResumeRepository resumeRepository;
    @Mock
    private ResumeAnalysisRepository analysisRepository;
    @Mock
    private ExtractedResumeSkillRepository skillRepository;
    @Mock
    private JobDescriptionRepository jdRepository;
    @Mock
    private JdResumeAnalysisRepository jdResumeAnalysisRepository;
    @Mock
    private ResumeImprovementSuggestionRepository suggestionRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private StudentProfileRepository profileRepository;
    @Mock
    private PdfTextExtractorService pdfExtractor;
    @Mock
    private ResumeStorageService storageService;
    @Mock
    private AIService aiService;
    @Mock
    private SkillGapAnalysisService skillGapService;
    @Mock
    private PlacementReadinessCalculatorService readinessService;
    @Mock
    private JobDescriptionService jobDescriptionService;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private ResumeService resumeService;

    private User user;
    private Resume sampleResume;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("student@test.com")
                .firstName("Jane")
                .lastName("Doe")
                .build();

        sampleResume = Resume.builder()
                .id(50L)
                .user(user)
                .versionNumber(1)
                .originalFilename("Jane_Doe_Resume.pdf")
                .storageFilename("resume_u1_v1_test.pdf")
                .fileSizeBytes(1024L)
                .fileHashSha256("abc123hash")
                .pageCount(1)
                .rawText("Jane Doe - Java, Spring Boot, MySQL, React developer. Phone: +91-9876543210. Email: jane@gmail.com")
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Should sanitize PII (email, phone) before AI analysis")
    void testPiiSanitizer() {
        String raw = "Candidate Email: student@hiresense.ai, Contact: 9876543210, Location: Bangalore 560001. Skills: Java, Spring Boot.";
        String sanitized = PiiSanitizer.sanitize(raw);

        assertFalse(sanitized.contains("student@hiresense.ai"));
        assertFalse(sanitized.contains("9876543210"));
        assertFalse(sanitized.contains("560001"));
        assertTrue(sanitized.contains("[EMAIL REDACTED]"));
        assertTrue(sanitized.contains("[PHONE REDACTED]"));
        assertTrue(sanitized.contains("[PINCODE REDACTED]"));
        assertTrue(sanitized.contains("Java, Spring Boot"));
    }

    @Test
    @DisplayName("Should upload valid PDF, calculate hash, store file, and create resume record")
    void testUploadResumeSuccess() {
        MockMultipartFile file = new MockMultipartFile("file", "resume.pdf", "application/pdf", "%PDF-sample".getBytes());

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(pdfExtractor.validateAndExtractText(any())).thenReturn(PdfTextExtractorService.ExtractedPdfData.builder()
                .text("Extracted text with Java and React")
                .pageCount(1)
                .sizeBytes(100L)
                .originalFilename("resume.pdf")
                .build());
        when(resumeRepository.findByUserIdOrderByVersionNumberDesc(1L)).thenReturn(new ArrayList<>());
        when(resumeRepository.save(any(Resume.class))).thenReturn(sampleResume);

        ResumeDto dto = resumeService.uploadResume(1L, file);

        assertNotNull(dto);
        assertEquals(1, dto.getVersionNumber());
        verify(storageService, times(1)).store(any(), any());
        verify(resumeRepository, times(1)).save(any(Resume.class));
    }

    @Test
    @DisplayName("Should perform AI analysis and persist structured findings & JD snapshots")
    void testAnalyzeResumeSuccess() {
        when(resumeRepository.findByIdAndUserId(50L, 1L)).thenReturn(Optional.of(sampleResume));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(analysisRepository.findFirstByResumeIdAndTargetRoleAndPromptVersion(eq(50L), any(), any()))
                .thenReturn(Optional.empty());

        ResumeAnalysisResultDto aiResult = ResumeAnalysisResultDto.builder()
                .overallScore(85)
                .atsOrientedScore(82)
                .targetRoleMatchSummary("Strong fit for software engineering")
                .sectionsFound(Arrays.asList("Education", "Technical Skills"))
                .extractedSkills(Arrays.asList("Java", "Spring Boot", "MySQL"))
                .strengths(Collections.singletonList("Good core Java competencies"))
                .weaknesses(Collections.singletonList("No cloud certifications"))
                .recommendations(Collections.singletonList("Add AWS experience"))
                .build();

        when(aiService.analyzeResume(any(), any(), any(), any())).thenReturn(aiResult);
        when(aiService.getProviderName()).thenReturn("MOCK");
        when(aiService.getModelName()).thenReturn("mock-deterministic-v1");

        when(analysisRepository.save(any(ResumeAnalysis.class))).thenAnswer(invocation -> {
            ResumeAnalysis a = invocation.getArgument(0);
            a.setId(100L);
            return a;
        });

        ResumeAnalysisResponse response = resumeService.analyzeResume(50L, 1L);

        assertNotNull(response);
        assertEquals(85, response.getOverallScore());
        assertEquals(82, response.getAtsOrientedScore());
        assertEquals("MOCK", response.getAiProvider());
        verify(analysisRepository, times(1)).save(any(ResumeAnalysis.class));
        verify(skillRepository, times(1)).saveAll(any());
        verify(jdResumeAnalysisRepository, times(1)).save(any(JdResumeAnalysis.class));
    }

    @Test
    @DisplayName("Should return cached analysis if identical resume version and target role exist")
    void testAnalyzeResumeReturnsCachedAnalysis() throws Exception {
        ResumeAnalysisResultDto aiResult = ResumeAnalysisResultDto.builder()
                .overallScore(88)
                .atsOrientedScore(85)
                .build();

        ResumeAnalysis cached = ResumeAnalysis.builder()
                .id(77L)
                .resume(sampleResume)
                .user(user)
                .targetRole("Software Engineer")
                .aiProvider("MOCK")
                .aiModel("mock-model")
                .overallScore(88)
                .atsOrientedScore(85)
                .structuredAnalysisJson(objectMapper.writeValueAsString(aiResult))
                .build();

        when(resumeRepository.findByIdAndUserId(50L, 1L)).thenReturn(Optional.of(sampleResume));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(analysisRepository.findFirstByResumeIdAndTargetRoleAndPromptVersion(eq(50L), eq("Software Engineer"), any()))
                .thenReturn(Optional.of(cached));

        ResumeAnalysisResponse response = resumeService.analyzeResume(50L, 1L);

        assertNotNull(response);
        assertEquals(88, response.getOverallScore());
        verify(aiService, never()).analyzeResume(any(), any(), any(), any());
    }

    @Test
    @DisplayName("IDOR Protection: Accessing another user's resume throws ResourceNotFoundException")
    void testIdorProtectionThrowsException() {
        when(resumeRepository.findByIdAndUserId(50L, 999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> resumeService.getResumeById(50L, 999L));
    }
}
