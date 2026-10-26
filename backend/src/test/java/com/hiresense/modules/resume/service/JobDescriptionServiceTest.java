package com.hiresense.modules.resume.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiresense.common.exception.ResourceNotFoundException;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.resume.dto.JobDescriptionCreateRequest;
import com.hiresense.modules.resume.dto.JobDescriptionDto;
import com.hiresense.modules.resume.model.JobDescription;
import com.hiresense.modules.resume.repository.JobDescriptionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobDescriptionServiceTest {

    @Mock
    private JobDescriptionRepository jdRepository;

    @Mock
    private UserRepository userRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private JobDescriptionService jdService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("student@test.com")
                .firstName("Alex")
                .build();
    }

    @Test
    @DisplayName("Create JD: Parses text and extracts languages, frameworks, DBs, and tools")
    void testCreateJobDescription() {
        JobDescriptionCreateRequest request = JobDescriptionCreateRequest.builder()
                .title("Senior Backend Developer")
                .company("FinTech Global")
                .location("Remote")
                .rawText("We need an engineer skilled in Java, Spring Boot, MySQL, Docker, Kubernetes, AWS, and REST API.")
                .build();

        JobDescription savedEntity = JobDescription.builder()
                .id(10L)
                .user(user)
                .title("Senior Backend Developer")
                .company("FinTech Global")
                .location("Remote")
                .rawText(request.getRawText())
                .active(true)
                .createdAt(Instant.now())
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(jdRepository.save(any(JobDescription.class))).thenReturn(savedEntity);

        JobDescriptionDto result = jdService.createJobDescription(1L, request);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertTrue(result.getProgrammingLanguages().contains("Java"));
        assertTrue(result.getFrameworks().contains("Spring Boot"));
        assertTrue(result.getDatabases().contains("MySQL"));
        assertTrue(result.getToolsAndCloud().contains("Docker"));
        assertTrue(result.getToolsAndCloud().contains("AWS"));
    }

    @Test
    @DisplayName("IDOR Protection: Accessing unauthorized JD throws ResourceNotFoundException")
    void testIdorProtectionOnJd() {
        when(jdRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> jdService.getJobDescriptionById(99L, 1L));
    }
}
