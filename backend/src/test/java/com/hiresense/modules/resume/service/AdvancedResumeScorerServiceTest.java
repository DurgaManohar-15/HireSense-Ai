package com.hiresense.modules.resume.service;

import com.hiresense.modules.resume.dto.AdvancedResumeScoreBreakdownDto;
import com.hiresense.modules.resume.dto.ResumeAnalysisResultDto;
import com.hiresense.modules.resume.dto.SkillEvidenceDetailDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class AdvancedResumeScorerServiceTest {

    private AdvancedResumeScorerService scorerService;

    @BeforeEach
    void setUp() {
        scorerService = new AdvancedResumeScorerService();
    }

    @Test
    @DisplayName("Deterministic Score Calculation: Returns mathematically bounded 6-component breakdown")
    void testDeterministicScoreCalculation() {
        String resumeText = """
                JOHN DOE
                Email: john.doe@example.com | Phone: +91-9876543210 | LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe
                
                PROFESSIONAL SUMMARY
                Aspiring Software Engineer with strong background in backend architectures, microservices, and database systems.
                
                EDUCATION
                Bachelor of Technology in Computer Science, ABC University, CGPA: 8.9/10 (2022-2026)
                
                TECHNICAL SKILLS
                Languages: Java, Python, JavaScript, SQL
                Frameworks: Spring Boot, React, Node.js, Express
                Databases: MySQL, PostgreSQL, MongoDB, Redis
                Cloud & DevOps: Docker, Git, GitHub
                Core CS: Data Structures, Algorithms, OOP, DBMS, Operating Systems
                
                PROJECTS
                1. E-Commerce Microservices Engine (Java, Spring Boot, MySQL, Redis, Docker)
                   - Architected scalable microservices handling 10,000 requests/minute.
                   - Optimized database query response times by 45% using Redis caching.
                   - Deployed containerized services with Docker and continuous integration.
                
                2. Real-Time Collaborative Canvas (React, Node.js, WebSocket, MongoDB)
                   - Developed multi-user live workspace supporting 50+ concurrent users per room.
                   - Refactored state synchronization algorithms, reducing latency by 30%.
                
                EXPERIENCE
                Software Engineering Intern - Tech Innovations Pvt Ltd (June 2025 - August 2025)
                   - Built RESTful APIs using Spring Boot and PostgreSQL for inventory tracking.
                   - Integrated automated JUnit test suites, increasing code coverage to 92%.
                
                CERTIFICATIONS
                Oracle Certified Associate: Java SE 17 Programmer
                """;

        String jd = """
                We are looking for a Backend Software Engineer.
                Requirements: Java, Spring Boot, MySQL, Docker, REST API, Microservices.
                Preferred: AWS, Kubernetes, Redis.
                """;

        ResumeAnalysisResultDto result = scorerService.computeDeterministicAnalysis(
                resumeText,
                "Backend Software Engineer",
                "Acme Corp",
                jd,
                List.of("Java", "SQL", "DBMS"),
                Map.of("java", 88, "sql", 82),
                Map.of("java", 80, "spring boot", 75)
        );

        assertNotNull(result);
        assertTrue(result.getOverallScore() >= 0 && result.getOverallScore() <= 100);
        assertTrue(result.getAtsOrientedScore() >= 0 && result.getAtsOrientedScore() <= 100);

        // Check 6-component breakdown
        AdvancedResumeScoreBreakdownDto breakdown = result.getScoreBreakdown();
        assertNotNull(breakdown);
        assertNotNull(breakdown.getContentQuality());
        assertNotNull(breakdown.getSkillsRelevance());
        assertNotNull(breakdown.getExperienceAndProjects());
        assertNotNull(breakdown.getKeywordRelevance());
        assertNotNull(breakdown.getStructureAndReadability());
        assertNotNull(breakdown.getAtsCompatibility());

        assertEquals(0.20, breakdown.getContentQuality().getWeight());
        assertEquals(0.20, breakdown.getSkillsRelevance().getWeight());
        assertEquals(0.20, breakdown.getExperienceAndProjects().getWeight());
        assertEquals(0.15, breakdown.getKeywordRelevance().getWeight());
        assertEquals(0.15, breakdown.getStructureAndReadability().getWeight());
        assertEquals(0.10, breakdown.getAtsCompatibility().getWeight());

        // Check Categorized Keywords
        assertNotNull(result.getCategorizedKeywords());
        assertFalse(result.getCategorizedKeywords().getProgrammingLanguages().isEmpty());
        assertFalse(result.getCategorizedKeywords().getFrameworksAndLibraries().isEmpty());
        assertFalse(result.getCategorizedKeywords().getDatabases().isEmpty());

        // Check JD Match
        assertNotNull(result.getJdMatchScore());
        assertTrue(result.getJdMatchScore() >= 50);
        assertTrue(result.getJdMatchingSkills().contains("Java"));
        assertTrue(result.getJdMatchingSkills().contains("Spring Boot"));
        assertTrue(result.getJdMatchingSkills().contains("Docker"));
    }

    @Test
    @DisplayName("ATS Compatibility: Identifies missing contact details and evaluates readability")
    void testAtsCompatibilityScoring() {
        String sparseResume = "Simple Developer text without email or phone numbers or standard headers. Knows Java.";

        ResumeAnalysisResultDto result = scorerService.computeDeterministicAnalysis(
                sparseResume,
                "Developer",
                "Company",
                null,
                Collections.emptyList(),
                Collections.emptyMap(),
                Collections.emptyMap()
        );

        assertNotNull(result);
        assertTrue(result.getAtsOrientedScore() < 70, "Sparse resume should score lower on ATS compatibility");
        assertTrue(result.getMissingSections().contains("Education"));
        assertTrue(result.getMissingSections().contains("Projects"));
    }

    @Test
    @DisplayName("Keyword Gap vs Actual Skill Gap: Distinguishes missing resume keyword from verified performance evidence")
    void testKeywordGapVsSkillGapDistinction() {
        // Resume has NO mention of Docker, but student has passed Docker assessment with 85%
        SkillEvidenceDetailDto evidence = scorerService.calibrateSkillEvidence(
                "Docker",
                false, // NOT in resume text
                "Java and SQL developer",
                Map.of("docker", 85), // Has assessment evidence!
                Map.of("docker", 80), // Has interview evidence!
                true,
                "REQUIRED"
        );

        assertNotNull(evidence);
        assertTrue(evidence.isResumeKeywordGap(), "Should be flagged as a Resume Keyword Gap");
        assertFalse(evidence.isActualSkillGap(), "Should NOT be flagged as an actual skill gap because evidence is high (82.5%)");
        assertEquals("STRONG_MATCH", evidence.getMatchStatus());
    }
}
