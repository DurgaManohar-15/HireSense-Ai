package com.hiresense.modules.coding.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "coding_problems")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodingProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "slug", nullable = false, unique = true)
    private String slug;

    @Column(name = "difficulty", nullable = false)
    @Builder.Default
    private String difficulty = "EASY"; // EASY, MEDIUM, HARD

    @Column(name = "topic", nullable = false)
    @Builder.Default
    private String topic = "ARRAYS"; // ARRAYS, STRINGS, TWO_POINTERS, HASHING, LINKED_LIST, STACK_QUEUE, TREES, GRAPHS, DYNAMIC_PROGRAMMING

    @Column(name = "company_tags")
    private String companyTags; // e.g. Amazon, Microsoft, TCS, Infosys

    @Column(name = "role_tags")
    private String roleTags; // e.g. Software Development Engineer (SDE), Backend Developer, Full Stack

    @Column(name = "frequency_tag")
    private String frequencyTag; // e.g. "Asked in 95% of Top Tech Placements"

    @Column(name = "frequency_score")
    @Builder.Default
    private Integer frequencyScore = 90; // 0 - 100

    @Column(name = "description", columnDefinition = "LONGTEXT", nullable = false)
    private String description;

    @Column(name = "constraints", columnDefinition = "TEXT")
    private String constraints;

    @Column(name = "examples_json", columnDefinition = "LONGTEXT")
    private String examplesJson; // JSON array of input, output, explanation

    @Column(name = "starter_code_json", columnDefinition = "LONGTEXT")
    private String starterCodeJson; // JSON map of language -> starter code

    @Column(name = "test_cases_json", columnDefinition = "LONGTEXT")
    private String testCasesJson; // JSON array of test cases

    @Column(name = "hints_json", columnDefinition = "LONGTEXT")
    private String hintsJson;

    @Column(name = "solution_json", columnDefinition = "LONGTEXT")
    private String solutionJson; // JSON containing approach & solution code

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }
}
