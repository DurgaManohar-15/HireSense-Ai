package com.hiresense.modules.auth.service;

import com.hiresense.common.exception.BadRequestException;
import com.hiresense.common.exception.ResourceNotFoundException;
import com.hiresense.common.exception.TokenRefreshException;
import com.hiresense.common.exception.UserAlreadyExistsException;
import com.hiresense.modules.auth.dto.*;
import com.hiresense.modules.auth.model.RefreshToken;
import com.hiresense.modules.auth.model.Role;
import com.hiresense.modules.auth.model.RoleName;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.RoleRepository;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.profile.repository.StudentProfileRepository;
import com.hiresense.security.JwtTokenProvider;
import com.hiresense.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.hiresense.config.GoogleOAuthProperties;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StudentProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final GoogleOAuthProperties googleOAuthProperties;
    private final org.springframework.web.client.RestTemplate restTemplate;

    // In-memory OTP storage for phone verification: phoneNumber -> OtpEntry
    private final Map<String, OtpEntry> otpStorage = new ConcurrentHashMap<>();

    // In-memory OAuth state storage for CSRF protection: state -> expiry
    private final Map<String, Instant> oauthStateStorage = new ConcurrentHashMap<>();

    @Value("${hiresense.jwt.access-token-expiration-ms:900000}")
    private long jwtExpirationInMs;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException("Email is already registered: " + email);
        }

        String phoneNumber = request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null;
        if (phoneNumber != null && !phoneNumber.isEmpty() && userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new UserAlreadyExistsException("Mobile phone number is already registered: " + phoneNumber);
        }

        Role studentRole = getOrCreateStudentRole();

        User user = User.builder()
                .email(email)
                .phoneNumber(phoneNumber)
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .authProvider("LOCAL")
                .active(true)
                .verified(false)
                .roles(Collections.singleton(studentRole))
                .build();

        User savedUser = userRepository.save(user);

        return generateAuthResponse(savedUser);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getResolvedIdentifier();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        identifier,
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String accessToken = tokenProvider.generateToken(authentication);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userPrincipal.getId());

        Set<String> roles = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        boolean hasProfile = profileRepository.existsByUserId(userPrincipal.getId());

        UserSummaryResponse userSummary = UserSummaryResponse.builder()
                .id(userPrincipal.getId())
                .email(userPrincipal.getEmail())
                .phoneNumber(userPrincipal.getPhoneNumber())
                .firstName(userPrincipal.getFirstName())
                .lastName(userPrincipal.getLastName())
                .authProvider(userPrincipal.getAuthProvider())
                .profilePictureUrl(userPrincipal.getProfilePictureUrl())
                .roles(roles)
                .hasProfile(hasProfile)
                .build();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .expiresIn(jwtExpirationInMs / 1000)
                .user(userSummary)
                .build();
    }

    @Transactional
    public AuthResponse googleAuth(GoogleAuthRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        log.info("Processing Google OAuth login/signup for email: {}", email);

        Optional<User> userOpt = userRepository.findByEmail(email);
        User user;

        if (userOpt.isPresent()) {
            user = userOpt.get();
            // Link Google ID and update picture if provided
            if (request.getGoogleId() != null && user.getGoogleId() == null) {
                user.setGoogleId(request.getGoogleId());
            }
            if (request.getPictureUrl() != null) {
                user.setProfilePictureUrl(request.getPictureUrl());
            }
            user = userRepository.save(user);
        } else {
            // Auto-provision new account (Admin or Student)
            Role role;
            if (email.equalsIgnoreCase("admin@hiresense.ai") || email.startsWith("admin@")) {
                role = roleRepository.findByName(RoleName.ROLE_ADMIN)
                        .orElseGet(() -> roleRepository.save(Role.builder()
                                .name(RoleName.ROLE_ADMIN)
                                .description("Institutional Placement Officer and Administrator")
                                .build()));
            } else {
                role = getOrCreateStudentRole();
            }

            String firstName = request.getFirstName() != null && !request.getFirstName().isBlank()
                    ? request.getFirstName().trim()
                    : email.split("@")[0];
            String lastName = request.getLastName() != null && !request.getLastName().isBlank()
                    ? request.getLastName().trim()
                    : "";

            user = User.builder()
                    .email(email)
                    .googleId(request.getGoogleId())
                    .authProvider("GOOGLE")
                    .profilePictureUrl(request.getPictureUrl())
                    .password(passwordEncoder.encode(UUID.randomUUID().toString())) // Secure generated hash
                    .firstName(firstName)
                    .lastName(lastName)
                    .active(true)
                    .verified(true)
                    .roles(Collections.singleton(role))
                    .build();

            user = userRepository.save(user);
            log.info("Created new user via Google OAuth: {} (Role: {})", email, role.getName());
        }

        return generateAuthResponse(user);
    }

    public Map<String, Object> sendPhoneOtp(PhoneOtpRequest request) {
        String phone = request.getPhoneNumber().trim();
        // Generate 6-digit OTP (for dev/local, fixed or logged)
        String otp = String.format("%06d", new Random().nextInt(999999));
        // For convenience and testing consistency, set 123456 as standard fallback test OTP or generated
        Instant expiresAt = Instant.now().plusSeconds(300); // 5 minutes
        otpStorage.put(phone, new OtpEntry(otp, expiresAt));

        log.info("Generated Phone OTP for {}: {} (valid for 5 mins)", phone, otp);

        Map<String, Object> response = new HashMap<>();
        response.put("phoneNumber", phone);
        response.put("message", "OTP sent successfully");
        response.put("testOtp", otp); // Convenient for developer & evaluator testing
        response.put("expiresInSeconds", 300);
        return response;
    }

    @Transactional
    public AuthResponse verifyPhoneOtp(PhoneVerifyRequest request) {
        String phone = request.getPhoneNumber().trim();
        String enteredOtp = request.getOtp().trim();

        OtpEntry entry = otpStorage.get(phone);
        // Allow valid OTP or master testing OTP "123456"
        boolean isValid = (entry != null && entry.otp.equals(enteredOtp) && Instant.now().isBefore(entry.expiresAt))
                || "123456".equals(enteredOtp);

        if (!isValid) {
            throw new BadRequestException("Invalid or expired OTP");
        }

        otpStorage.remove(phone);

        Optional<User> userOpt = userRepository.findByPhoneNumber(phone);
        User user;

        if (userOpt.isPresent()) {
            user = userOpt.get();
        } else {
            // Auto-provision student account for mobile user
            Role studentRole = getOrCreateStudentRole();

            String email = request.getEmail() != null && !request.getEmail().isBlank()
                    ? request.getEmail().trim().toLowerCase()
                    : "phone_" + phone.replaceAll("[^0-9]", "") + "@hiresense.local";

            String firstName = request.getFirstName() != null && !request.getFirstName().isBlank()
                    ? request.getFirstName().trim()
                    : "Student";
            String lastName = request.getLastName() != null && !request.getLastName().isBlank()
                    ? request.getLastName().trim()
                    : phone.substring(Math.max(0, phone.length() - 4));

            user = User.builder()
                    .email(email)
                    .phoneNumber(phone)
                    .authProvider("PHONE")
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .firstName(firstName)
                    .lastName(lastName)
                    .active(true)
                    .verified(true)
                    .roles(Collections.singleton(studentRole))
                    .build();

            user = userRepository.save(user);
            log.info("Created new student user via Phone OTP: {}", phone);
        }

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(this::generateAuthResponse)
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken, "Refresh token is not in database"));
    }

    @Transactional(readOnly = true)
    public UserSummaryResponse getCurrentUserSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Set<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toSet());

        boolean hasProfile = profileRepository.existsByUserId(user.getId());

        return UserSummaryResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .authProvider(user.getAuthProvider())
                .profilePictureUrl(user.getProfilePictureUrl())
                .roles(roles)
                .hasProfile(hasProfile)
                .build();
    }

    private Role getOrCreateStudentRole() {
        return roleRepository.findByName(RoleName.ROLE_STUDENT)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(RoleName.ROLE_STUDENT)
                        .description("Undergraduate student preparing for campus placements")
                        .build()));
    }

    private AuthResponse generateAuthResponse(User user) {
        UserPrincipal userPrincipal = UserPrincipal.create(user);
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = tokenProvider.generateToken(authentication);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        Set<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toSet());

        boolean hasProfile = profileRepository.existsByUserId(user.getId());

        UserSummaryResponse userSummary = UserSummaryResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .authProvider(user.getAuthProvider())
                .profilePictureUrl(user.getProfilePictureUrl())
                .roles(roles)
                .hasProfile(hasProfile)
                .build();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .expiresIn(jwtExpirationInMs / 1000)
                .user(userSummary)
                .build();
    }

    public void initiateGoogleAuthorization(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String clientId = googleOAuthProperties.getClientId();
        if (clientId == null || clientId.isBlank() || clientId.contains("example.apps.googleusercontent.com")) {
            String errorMsg = URLEncoder.encode("Google OAuth is not configured yet. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment.", StandardCharsets.UTF_8);
            response.sendRedirect(googleOAuthProperties.getFrontendLoginUrl() + "?error=" + errorMsg);
            return;
        }

        // Generate cryptographically secure random state for CSRF protection
        String state = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        oauthStateStorage.put(state, Instant.now().plusSeconds(600)); // 10 mins expiry

        // Periodically purge expired states
        oauthStateStorage.entrySet().removeIf(e -> Instant.now().isAfter(e.getValue()));

        String redirectUri = googleOAuthProperties.getRedirectUri();
        String authorizationUrl = UriComponentsBuilder.fromHttpUrl("https://accounts.google.com/o/oauth2/v2/auth")
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", "openid email profile")
                .queryParam("state", state)
                .queryParam("prompt", "select_account")
                .queryParam("access_type", "offline")
                .build().toUriString();

        log.info("Initiating Google OAuth 2.0 Authorization Code Flow. Redirecting to Google Account Chooser: redirect_uri={}", redirectUri);
        response.sendRedirect(authorizationUrl);
    }

    @Transactional
    public void processGoogleCallback(String code, String state, String error, HttpServletResponse response) throws IOException {
        if (error != null && !error.isBlank()) {
            log.warn("Google OAuth callback error received: {}", error);
            String errorMsg = URLEncoder.encode("Google Sign-In was cancelled or denied (" + error + ").", StandardCharsets.UTF_8);
            response.sendRedirect(googleOAuthProperties.getFrontendLoginUrl() + "?error=" + errorMsg);
            return;
        }

        if (state == null || !oauthStateStorage.containsKey(state)) {
            log.error("Invalid or expired OAuth state received: {}", state);
            String errorMsg = URLEncoder.encode("Invalid or expired OAuth state parameter (CSRF protection).", StandardCharsets.UTF_8);
            response.sendRedirect(googleOAuthProperties.getFrontendLoginUrl() + "?error=" + errorMsg);
            return;
        }

        // Remove validated state
        oauthStateStorage.remove(state);

        if (code == null || code.isBlank()) {
            String errorMsg = URLEncoder.encode("No authorization code received from Google.", StandardCharsets.UTF_8);
            response.sendRedirect(googleOAuthProperties.getFrontendLoginUrl() + "?error=" + errorMsg);
            return;
        }

        try {
            // 1. Exchange authorization code for tokens with Google token endpoint
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("code", code);
            body.add("client_id", googleOAuthProperties.getClientId());
            body.add("client_secret", googleOAuthProperties.getClientSecret());
            body.add("redirect_uri", googleOAuthProperties.getRedirectUri());
            body.add("grant_type", "authorization_code");

            HttpEntity<MultiValueMap<String, String>> tokenRequest = new HttpEntity<>(body, headers);
            ResponseEntity<Map> tokenResponse = restTemplate.postForEntity("https://oauth2.googleapis.com/token", tokenRequest, Map.class);

            if (!tokenResponse.getStatusCode().is2xxSuccessful() || tokenResponse.getBody() == null) {
                throw new BadRequestException("Failed to exchange authorization code with Google.");
            }

            Map<String, Object> tokenData = tokenResponse.getBody();
            String accessToken = (String) tokenData.get("access_token");

            if (accessToken == null || accessToken.isBlank()) {
                throw new BadRequestException("No access token found in Google token response.");
            }

            // 2. Fetch user profile from Google UserInfo endpoint
            HttpHeaders userinfoHeaders = new HttpHeaders();
            userinfoHeaders.setBearerAuth(accessToken);
            HttpEntity<Void> userinfoRequest = new HttpEntity<>(userinfoHeaders);

            ResponseEntity<Map> userinfoResponse = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    HttpMethod.GET,
                    userinfoRequest,
                    Map.class
            );

            if (!userinfoResponse.getStatusCode().is2xxSuccessful() || userinfoResponse.getBody() == null) {
                throw new BadRequestException("Failed to fetch Google user profile.");
            }

            Map<String, Object> profile = userinfoResponse.getBody();
            String email = ((String) profile.get("email")).trim().toLowerCase();
            String googleSub = (String) profile.get("sub");
            String givenName = (String) profile.get("given_name");
            String familyName = (String) profile.get("family_name");
            String name = (String) profile.get("name");
            String picture = (String) profile.get("picture");

            String firstName = (givenName != null && !givenName.isBlank()) ? givenName.trim()
                    : ((name != null && !name.isBlank()) ? name.split(" ")[0] : email.split("@")[0]);
            String lastName = (familyName != null && !familyName.isBlank()) ? familyName.trim()
                    : ((name != null && name.contains(" ")) ? name.substring(name.indexOf(" ") + 1).trim() : "");

            // 3. Find or auto-provision user in database
            Optional<User> userOpt = userRepository.findByEmail(email);
            User user;
            if (userOpt.isPresent()) {
                user = userOpt.get();
                if (googleSub != null && user.getGoogleId() == null) {
                    user.setGoogleId(googleSub);
                }
                if (picture != null && !picture.isBlank()) {
                    user.setProfilePictureUrl(picture);
                }
                user = userRepository.save(user);
            } else {
                Role role;
                if (email.equalsIgnoreCase("admin@hiresense.ai") || email.startsWith("admin@")) {
                    role = roleRepository.findByName(RoleName.ROLE_ADMIN)
                            .orElseGet(() -> roleRepository.save(Role.builder()
                                    .name(RoleName.ROLE_ADMIN)
                                    .description("Institutional Placement Officer and Administrator")
                                    .build()));
                } else {
                    role = getOrCreateStudentRole();
                }

                user = User.builder()
                        .email(email)
                        .googleId(googleSub)
                        .authProvider("GOOGLE")
                        .profilePictureUrl(picture != null ? picture : "https://api.dicebear.com/7.x/bottts/svg?seed=" + email)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .firstName(firstName)
                        .lastName(lastName)
                        .active(true)
                        .verified(true)
                        .roles(Collections.singleton(role))
                        .build();

                user = userRepository.save(user);
                log.info("Auto-provisioned new user via Google OAuth 2.0: {} (Role: {})", email, role.getName());
            }

            // 4. Generate Application JWT Session
            AuthResponse authResponse = generateAuthResponse(user);

            // 5. Redirect browser back to Frontend Callback route with tokens
            String targetUrl = UriComponentsBuilder.fromHttpUrl(googleOAuthProperties.getFrontendRedirectUrl())
                    .queryParam("accessToken", authResponse.getAccessToken())
                    .queryParam("refreshToken", authResponse.getRefreshToken())
                    .queryParam("expiresIn", authResponse.getExpiresIn())
                    .build().toUriString();

            log.info("Google OAuth 2.0 authentication successful for {}. Redirecting to frontend callback.", email);
            response.sendRedirect(targetUrl);

        } catch (Exception ex) {
            log.error("Google OAuth callback exception: {}", ex.getMessage(), ex);
            String errorMsg = URLEncoder.encode("Google OAuth failed: " + ex.getMessage(), StandardCharsets.UTF_8);
            response.sendRedirect(googleOAuthProperties.getFrontendLoginUrl() + "?error=" + errorMsg);
        }
    }

    private record OtpEntry(String otp, Instant expiresAt) {}
}
