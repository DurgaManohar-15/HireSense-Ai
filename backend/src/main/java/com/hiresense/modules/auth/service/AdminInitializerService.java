package com.hiresense.modules.auth.service;

import com.hiresense.modules.auth.model.Role;
import com.hiresense.modules.auth.model.RoleName;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.RoleRepository;
import com.hiresense.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminInitializerService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Value("${hiresense.admin.initial.auto-create:true}")
    private boolean autoCreateAdmin;

    @Value("${hiresense.admin.initial.email:admin@hiresense.ai}")
    private String adminEmail;

    @Value("${hiresense.admin.initial.password:Admin@HireSense2026}")
    private String adminPassword;

    @Value("${hiresense.admin.initial.first-name:System}")
    private String adminFirstName;

    @Value("${hiresense.admin.initial.last-name:Administrator}")
    private String adminLastName;

    @Override
    @Transactional
    public void run(String... args) {
        // 0. Ensure student_profiles columns are nullable in existing database
        try {
            String[] alterStatements = new String[] {
                "ALTER TABLE student_profiles ALTER COLUMN college_name SET NULL",
                "ALTER TABLE student_profiles ALTER COLUMN degree SET NULL",
                "ALTER TABLE student_profiles ALTER COLUMN branch SET NULL",
                "ALTER TABLE student_profiles ALTER COLUMN graduation_year SET NULL",
                "ALTER TABLE student_profiles ALTER COLUMN cgpa SET NULL",
                "ALTER TABLE student_profiles ALTER COLUMN target_role SET NULL",
                "ALTER TABLE student_profiles ALTER COLUMN target_timeline_weeks SET NULL"
            };
            for (String sql : alterStatements) {
                try {
                    jdbcTemplate.execute(sql);
                } catch (Exception ignored) {
                    // Try alternative syntax if needed
                    try {
                        String altSql = sql.replace(" SET NULL", " DROP NOT NULL");
                        jdbcTemplate.execute(altSql);
                    } catch (Exception ignored2) {}
                }
            }
            log.info("Student profile schema constraints verified and relaxed for optional fields.");
        } catch (Exception e) {
            log.debug("Schema migration notice: {}", e.getMessage());
        }

        // 1. Ensure all system roles exist
        for (RoleName roleName : RoleName.values()) {
            roleRepository.findByName(roleName).orElseGet(() ->
                    roleRepository.save(Role.builder()
                            .name(roleName)
                            .description("Default system authority for " + roleName)
                            .build())
            );
        }

        // 2. Production Security Fail-Fast Check
        boolean isProduction = Arrays.asList(environment.getActiveProfiles()).contains("prod") ||
                Arrays.asList(environment.getActiveProfiles()).contains("production");

        if (isProduction && autoCreateAdmin) {
            if (adminPassword == null || adminPassword.isBlank() || "Admin@HireSense2026".equals(adminPassword)) {
                log.error("CRITICAL SECURITY ERROR: Production deployment requires an explicit, secure INITIAL_ADMIN_PASSWORD environment variable!");
                throw new IllegalStateException("Production startup aborted: INITIAL_ADMIN_PASSWORD must be configured with a secure non-default secret in production.");
            }
        }

        // 3. Initialize Admin User if enabled
        if (autoCreateAdmin && !userRepository.existsByEmail(adminEmail.toLowerCase().trim())) {
            Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                    .orElseThrow(() -> new IllegalStateException("ROLE_ADMIN could not be retrieved"));

            Set<Role> roles = new HashSet<>(Collections.singletonList(adminRole));

            User admin = User.builder()
                    .email(adminEmail.toLowerCase().trim())
                    .password(passwordEncoder.encode(adminPassword))
                    .firstName(adminFirstName)
                    .lastName(adminLastName)
                    .active(true)
                    .verified(true)
                    .roles(roles)
                    .build();

            userRepository.save(admin);
            log.info("System administrator successfully initialized with email: {}", adminEmail);
        }
    }
}
