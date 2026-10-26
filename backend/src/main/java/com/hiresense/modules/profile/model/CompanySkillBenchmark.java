package com.hiresense.modules.profile.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "company_skill_benchmarks")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanySkillBenchmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private TargetCompany company;

    @Column(name = "skill_name", nullable = false, length = 100)
    private String skillName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BenchmarkCategory category;

    @Column(name = "minimum_proficiency", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal minimumProficiency = new BigDecimal("60.00");

    @Column(nullable = false, precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal weight = new BigDecimal("1.00");

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
