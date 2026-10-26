package com.hiresense.modules.auth.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.auth.dto.*;
import com.hiresense.modules.auth.service.AuthService;
import com.hiresense.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @GetMapping("/google")
    public void initiateGoogleOAuth(jakarta.servlet.http.HttpServletRequest request,
                                   jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        authService.initiateGoogleAuthorization(request, response);
    }

    @GetMapping("/google/callback")
    public void handleGoogleOAuthCallback(@RequestParam(value = "code", required = false) String code,
                                         @RequestParam(value = "state", required = false) String state,
                                         @RequestParam(value = "error", required = false) String error,
                                         jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        authService.processGoogleCallback(code, state, error, response);
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleAuth(@Valid @RequestBody GoogleAuthRequest request) {
        AuthResponse response = authService.googleAuth(request);
        return ResponseEntity.ok(ApiResponse.success("Google authentication successful", response));
    }

    @PostMapping("/phone/send-otp")
    public ResponseEntity<ApiResponse<Object>> sendPhoneOtp(@Valid @RequestBody PhoneOtpRequest request) {
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully", authService.sendPhoneOtp(request)));
    }

    @PostMapping("/phone/verify")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyPhoneOtp(@Valid @RequestBody PhoneVerifyRequest request) {
        AuthResponse response = authService.verifyPhoneOtp(request);
        return ResponseEntity.ok(ApiResponse.success("Phone verified and logged in successfully", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        UserSummaryResponse summary = authService.getCurrentUserSummary(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
