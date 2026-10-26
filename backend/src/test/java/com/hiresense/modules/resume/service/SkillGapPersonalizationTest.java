package com.hiresense.modules.resume.service;

import com.hiresense.modules.resume.dto.ResumeAnalysisResultDto;
import com.hiresense.modules.resume.dto.SkillEvidenceDetailDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class SkillGapPersonalizationTest {

    private AdvancedResumeScorerService scorerService;

    private static final String FULL_STACK_JD = """
            FULL STACK SOFTWARE ENGINEER JOB SPECIFICATION
            Company: CloudScale Solutions
            
            Key Required Technologies:
            - Java, Spring Boot
            - Python, FastAPI
            - SQL, PostgreSQL
            - AWS Cloud (EC2, S3, RDS)
            - Docker, Kubernetes
            - REST API Design
            """;

    @BeforeEach
    void setUp() {
        scorerService = new AdvancedResumeScorerService();
    }

    @Test
    @DisplayName("Personalization Verification: Student A (Java/SQL Strong, AWS Weak) vs Student B (Python/AWS Strong, Java Weak)")
    void testPersonalizedSkillGapDifferences() {
        // =========================================================================
        // Student A: Strong in Java & SQL, Weak in AWS
        // =========================================================================
        String resumeStudentA = """
                STUDENT A - BACKEND JAVA SPECIALIST
                Email: studenta@test.com | Phone: 9876543210
                
                EDUCATION
                B.Tech in Computer Science (2022-2026) - CGPA 9.1/10
                
                TECHNICAL SKILLS
                Languages: Java, SQL, C++
                Frameworks: Spring Boot, Hibernate
                Databases: PostgreSQL, MySQL, Redis
                Tools: Git, REST API, JUnit
                
                PROJECTS
                - Distributed Banking Ledger in Java & Spring Boot: Handled 5,000 transactions/sec with ACID compliance in PostgreSQL.
                - High-Throughput SQL Query Engine: Optimized complex multi-table joins reducing execution latency by 40%.
                """;

        Map<String, Integer> assessmentScoresStudentA = Map.of(
                "java", 92,
                "sql", 88,
                "spring boot", 85
        );
        Map<String, Integer> interviewScoresStudentA = Map.of(
                "java", 86,
                "sql", 84
        );

        ResumeAnalysisResultDto resultA = scorerService.computeDeterministicAnalysis(
                resumeStudentA,
                "Full Stack Engineer",
                "CloudScale Solutions",
                FULL_STACK_JD,
                List.of("Java", "SQL", "Spring Boot"),
                assessmentScoresStudentA,
                interviewScoresStudentA
        );

        // =========================================================================
        // Student B: Strong in Python & AWS, Weak in Java
        // =========================================================================
        String resumeStudentB = """
                STUDENT B - CLOUD & PYTHON SPECIALIST
                Email: studentb@test.com | Phone: 9123456789
                
                EDUCATION
                B.Tech in Computer Science (2022-2026) - CGPA 8.8/10
                
                TECHNICAL SKILLS
                Languages: Python, JavaScript
                Frameworks: FastAPI, Django
                Cloud & DevOps: AWS (EC2, S3, RDS, Lambda), Docker, Kubernetes, Terraform
                Tools: Git, REST API, CI/CD
                
                PROJECTS
                - Serverless Data Ingestion on AWS Lambda & S3: Processed 20GB daily streaming datasets with 99.99% uptime.
                - Microservices Deployment with Docker & Kubernetes on AWS EKS: Automated auto-scaling container infrastructure.
                """;

        Map<String, Integer> assessmentScoresStudentB = Map.of(
                "python", 90,
                "aws", 92,
                "docker", 88
        );
        Map<String, Integer> interviewScoresStudentB = Map.of(
                "python", 85,
                "aws", 88
        );

        ResumeAnalysisResultDto resultB = scorerService.computeDeterministicAnalysis(
                resumeStudentB,
                "Full Stack Engineer",
                "CloudScale Solutions",
                FULL_STACK_JD,
                List.of("Python", "AWS", "Docker"),
                assessmentScoresStudentB,
                interviewScoresStudentB
        );

        // =========================================================================
        // ASSERTIONS PROVING DISTINCT, PERSON-SPECIFIC RESULTS FOR SAME JD
        // =========================================================================
        assertNotNull(resultA);
        assertNotNull(resultB);

        // 1. Verify Student A's Strong Matches vs Gaps
        List<SkillEvidenceDetailDto> skillsA = resultA.getSkillEvidenceDetails();
        SkillEvidenceDetailDto javaA = skillsA.stream().filter(s -> s.getSkillName().equalsIgnoreCase("Java")).findFirst().orElseThrow();
        SkillEvidenceDetailDto sqlA = skillsA.stream().filter(s -> s.getSkillName().equalsIgnoreCase("SQL")).findFirst().orElseThrow();
        SkillEvidenceDetailDto awsA = skillsA.stream().filter(s -> s.getSkillName().equalsIgnoreCase("AWS")).findFirst().orElseThrow();

        assertEquals("STRONG_MATCH", javaA.getMatchStatus(), "Student A should have Java as a Strong Match");
        assertEquals("STRONG_MATCH", sqlA.getMatchStatus(), "Student A should have SQL as a Strong Match");
        assertTrue(javaA.getCurrentObservedLevel() >= 80);
        assertTrue(sqlA.getCurrentObservedLevel() >= 80);
        assertEquals(0, javaA.getGapScore());
        assertEquals(0, sqlA.getGapScore());

        // AWS for Student A must be an unfulfilled gap
        assertTrue(awsA.getGapScore() > 0, "Student A must have an AWS gap");
        assertTrue(awsA.isActualSkillGap(), "Student A must have an actual AWS skill gap");
        assertEquals("NOT_DEMONSTRATED", awsA.getMatchStatus());

        // 2. Verify Student B's Strong Matches vs Gaps
        List<SkillEvidenceDetailDto> skillsB = resultB.getSkillEvidenceDetails();
        SkillEvidenceDetailDto awsB = skillsB.stream().filter(s -> s.getSkillName().equalsIgnoreCase("AWS")).findFirst().orElseThrow();
        SkillEvidenceDetailDto pythonB = skillsB.stream().filter(s -> s.getSkillName().equalsIgnoreCase("Python")).findFirst().orElseThrow();
        SkillEvidenceDetailDto javaB = skillsB.stream().filter(s -> s.getSkillName().equalsIgnoreCase("Java")).findFirst().orElseThrow();

        assertEquals("STRONG_MATCH", awsB.getMatchStatus(), "Student B should have AWS as a Strong Match");
        assertEquals("STRONG_MATCH", pythonB.getMatchStatus(), "Student B should have Python as a Strong Match");
        assertTrue(awsB.getCurrentObservedLevel() >= 80);
        assertEquals(0, awsB.getGapScore());

        // Java for Student B must be an unfulfilled gap
        assertTrue(javaB.getGapScore() > 0, "Student B must have a Java gap");
        assertTrue(javaB.isActualSkillGap(), "Student B must have an actual Java skill gap");
        assertEquals("NOT_DEMONSTRATED", javaB.getMatchStatus());

        // 3. Verify Learning Priorities are completely distinct
        assertNotEquals(resultA.getLearningPriorities(), resultB.getLearningPriorities(),
                "Learning priorities for Student A and Student B must be completely differentiated!");

        assertTrue(resultA.getLearningPriorities().stream().anyMatch(p -> p.contains("AWS")),
                "Student A priorities must recommend AWS");
        assertTrue(resultB.getLearningPriorities().stream().anyMatch(p -> p.contains("Java")),
                "Student B priorities must recommend Java");
    }
}
