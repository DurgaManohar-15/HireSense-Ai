package com.hiresense.modules.platform.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "target_roles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TargetRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String name;

    @Column(nullable = false, length = 80)
    @Builder.Default
    private String category = "ENGINEERING";

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "expected_core_skills", columnDefinition = "TEXT")
    private String expectedCoreSkills;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
