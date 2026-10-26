package com.hiresense.modules.auth.service;

import com.hiresense.common.exception.UserAlreadyExistsException;
import com.hiresense.modules.auth.dto.AuthResponse;
import com.hiresense.modules.auth.dto.RegisterRequest;
import com.hiresense.modules.auth.model.RefreshToken;
import com.hiresense.modules.auth.model.Role;
import com.hiresense.modules.auth.model.RoleName;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.RoleRepository;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.profile.repository.StudentProfileRepository;
import com.hiresense.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private StudentProfileRepository profileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private com.hiresense.config.GoogleOAuthProperties googleOAuthProperties;

    @Mock
    private org.springframework.web.client.RestTemplate restTemplate;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private Role studentRole;
    private User savedUser;
    private RefreshToken refreshToken;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .email("student@test.com")
                .password("Password@123")
                .firstName("John")
                .lastName("Doe")
                .build();

        studentRole = Role.builder()
                .id(1L)
                .name(RoleName.ROLE_STUDENT)
                .description("Student")
                .build();

        savedUser = User.builder()
                .id(100L)
                .email("student@test.com")
                .password("hashed_pwd")
                .firstName("John")
                .lastName("Doe")
                .active(true)
                .roles(Collections.singleton(studentRole))
                .build();

        refreshToken = RefreshToken.builder()
                .id(1L)
                .token("mock-refresh-token-uuid")
                .user(savedUser)
                .expiryDate(Instant.now().plusSeconds(3600))
                .revoked(false)
                .build();
    }

    @Test
    @DisplayName("Should successfully register new student and return AuthResponse")
    void testRegisterSuccess() {
        when(userRepository.existsByEmail("student@test.com")).thenReturn(false);
        when(roleRepository.findByName(RoleName.ROLE_STUDENT)).thenReturn(Optional.of(studentRole));
        when(passwordEncoder.encode("Password@123")).thenReturn("hashed_pwd");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(tokenProvider.generateToken(any())).thenReturn("mock.jwt.token");
        when(refreshTokenService.createRefreshToken(100L)).thenReturn(refreshToken);

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getAccessToken());
        assertEquals("mock-refresh-token-uuid", response.getRefreshToken());
        assertEquals("student@test.com", response.getUser().getEmail());
        assertTrue(response.getUser().getRoles().contains("ROLE_STUDENT"));
        assertFalse(response.getUser().isHasProfile());

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw UserAlreadyExistsException if email already registered")
    void testRegisterDuplicateEmailThrowsException() {
        when(userRepository.existsByEmail("student@test.com")).thenReturn(true);

        assertThrows(UserAlreadyExistsException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }
}
