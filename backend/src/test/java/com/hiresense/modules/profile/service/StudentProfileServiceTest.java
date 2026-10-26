package com.hiresense.modules.profile.service;

import com.hiresense.common.exception.ResourceNotFoundException;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.profile.dto.SkillDto;
import com.hiresense.modules.profile.dto.StudentProfileRequest;
import com.hiresense.modules.profile.dto.StudentProfileResponse;
import com.hiresense.modules.profile.model.Skill;
import com.hiresense.modules.profile.model.SkillProficiency;
import com.hiresense.modules.profile.model.StudentProfile;
import com.hiresense.modules.profile.repository.SkillRepository;
import com.hiresense.modules.profile.repository.StudentProfileRepository;
import com.hiresense.modules.profile.repository.TargetCompanyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentProfileServiceTest {

    @Mock
    private StudentProfileRepository profileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TargetCompanyRepository targetCompanyRepository;

    @Mock
    private SkillRepository skillRepository;

    @Mock
    private TargetCompanyService targetCompanyService;

    @InjectMocks
    private StudentProfileService profileService;

    private User user;
    private StudentProfile profile;
    private StudentProfileRequest profileRequest;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("student@test.com")
                .firstName("Jane")
                .lastName("Doe")
                .build();

        profile = StudentProfile.builder()
                .id(10L)
                .user(user)
                .collegeName("Test Engineering College")
                .degree("B.Tech")
                .branch("Computer Science")
                .graduationYear(2026)
                .cgpa(new BigDecimal("8.75"))
                .targetRole("Software Engineer")
                .targetTimelineWeeks(12)
                .skills(new ArrayList<>())
                .projects(new ArrayList<>())
                .certifications(new ArrayList<>())
                .build();

        profileRequest = StudentProfileRequest.builder()
                .firstName("Jane")
                .lastName("Doe")
                .collegeName("Test Engineering College")
                .degree("B.Tech")
                .branch("Computer Science")
                .graduationYear(2026)
                .cgpa(new BigDecimal("8.75"))
                .targetRole("Software Engineer")
                .targetTimelineWeeks(12)
                .skills(Collections.singletonList(
                        SkillDto.builder().name("Java").category("PROGRAMMING_LANGUAGE").proficiencyLevel(SkillProficiency.INTERMEDIATE).build()
                ))
                .build();
    }

    @Test
    @DisplayName("Should retrieve existing student profile successfully")
    void testGetProfileSuccess() {
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));

        StudentProfileResponse response = profileService.getProfileByUserId(1L);

        assertNotNull(response);
        assertTrue(response.isProfileComplete());
        assertEquals("Test Engineering College", response.getCollegeName());
        assertEquals("B.Tech", response.getDegree());
        assertEquals("Computer Science", response.getBranch());
        assertEquals(new BigDecimal("8.75"), response.getCgpa());
    }

    @Test
    @DisplayName("Should return empty uncompleted profile when profile record not found but user exists")
    void testGetProfileNotYetCreated() {
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        StudentProfileResponse response = profileService.getProfileByUserId(1L);

        assertNotNull(response);
        assertFalse(response.isProfileComplete());
        assertEquals("Jane", response.getFirstName());
        assertEquals("Doe", response.getLastName());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when user also not found")
    void testGetProfileUserNotFound() {
        when(profileRepository.findByUserId(99L)).thenReturn(Optional.empty());
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> profileService.getProfileByUserId(99L));
    }

    @Test
    @DisplayName("Should create or update profile successfully with skills")
    void testCreateOrUpdateProfileSuccess() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));
        when(skillRepository.findByNameIgnoreCase("Java")).thenReturn(Optional.of(
                Skill.builder().id(5L).name("Java").category("PROGRAMMING_LANGUAGE").build()
        ));
        when(profileRepository.saveAndFlush(any(StudentProfile.class))).thenReturn(profile);

        StudentProfileResponse response = profileService.createOrUpdateProfile(1L, profileRequest);

        assertNotNull(response);
        assertEquals("Software Engineer", response.getTargetRole());
        verify(profileRepository, atLeastOnce()).saveAndFlush(any(StudentProfile.class));
    }
}
