package com.hiresense.modules.intelligence.service;

import com.hiresense.modules.intelligence.dto.JdSkillGapAnalysisResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JdSkillGapCalibrationEngineTest {

    private JdSkillGapCalibrationEngine engine;

    @BeforeEach
    void setUp() {
        engine = new JdSkillGapCalibrationEngine();
    }

    @Test
    @DisplayName("Should detect domain mismatch and genuine low score for BDA role with tech candidate skills")
    void testBusinessDevelopmentAssociateDomainMismatch() {
        String knownSkills = "java,html,spring,react.js,css,mysql";
        String jdText = "As an Business Devploment Associate at GradGenious, you will support student enrollments " +
                "for our industry-oriented learning programs. You will connect with prospective learners, " +
                "understand their career goals, provide suitable program guidance, and help convert qualified prospects " +
                "into successful enrollments. ROLE OVERVIEW Company: GradGenious Edutech Private Limited " +
                "Job Designation: Business Devploment Associate Department: Sales and Marketing " +
                "Location: Hyderabad, Telangana (Work from Office) 3 Months+PPO ABOUT GRADGENIOUS INTERVIEW PROCESS " +
                "Group Discussion HR Interview GradGenious helps students bridge the gap between academic learning " +
                "and career opportunities through industry-oriented training, practical projects, mentorship, and career support.";

        JdSkillGapAnalysisResponse response = engine.analyzeJd(knownSkills, jdText, null, null);

        assertNotNull(response);
        assertTrue(response.isHasDomainMismatch(), "Should detect domain mismatch between software skills and BDA sales role");
        assertTrue(response.getMatchScore() <= 20, "Match score should be genuine and low (<=20%), not fake 70%. Actual: " + response.getMatchScore());
        assertEquals("Business Devploment Associate", response.getTargetRole());
        assertEquals("GradGenious Edutech Private Limited", response.getTargetCompany());
        assertTrue(response.getTargetDomain().contains("Sales"), "Target domain should be Sales & Business Development");
        assertTrue(response.getCandidateDomain().contains("Software"), "Candidate domain should be Software Engineering");

        // Gaps must include actual sales/enrollment competencies
        assertTrue(response.getGapSkills().stream().anyMatch(g -> g.contains("Enrollments") || g.contains("Lead Conversion")),
                "Must include critical sales/enrollment gaps");

        // Surplus skills should include candidate's unused software skills
        assertTrue(response.getSurplusSkills().stream().anyMatch(s -> s.equalsIgnoreCase("Java") || s.equalsIgnoreCase("Spring")),
                "Must list Java/Spring as surplus non-required skills for this role");

        // Difference summary must clearly explain the disconnect
        assertTrue(response.getDomainDifferenceSummary().contains("Mismatch"), "Summary must explain the domain disconnect");
    }

    @Test
    @DisplayName("Should detect high match when candidate skills align with a Java Backend Developer role")
    void testTechnicalRoleAlignment() {
        String knownSkills = "Java, Spring Boot, MySQL, REST APIs, Git";
        String jdText = "Company: TechCorp. Role: Java Backend Engineer. Requirements: Java 17, Spring Boot, REST APIs, " +
                "MySQL database, Docker containerization, AWS cloud, and Git version control.";

        JdSkillGapAnalysisResponse response = engine.analyzeJd(knownSkills, jdText, null, null);

        assertNotNull(response);
        assertFalse(response.isHasDomainMismatch(), "Should NOT flag domain mismatch for tech candidate applying to tech role");
        assertTrue(response.getMatchScore() >= 50, "Match score should be high for aligned tech skills. Actual: " + response.getMatchScore());
        assertTrue(response.getMatchedSkills().stream().anyMatch(m -> m.contains("Java") || m.contains("Spring")),
                "Should identify Java/Spring as demonstrated strengths");
        assertTrue(response.getGapSkills().stream().anyMatch(g -> g.contains("Docker") || g.contains("Cloud")),
                "Should identify Docker/Cloud as actual missing gap skills");
    }

    @Test
    @DisplayName("Should dynamically extract arbitrary non-tech job description (e.g. Clinical Registered Nurse)")
    void testArbitraryHealthcareJobDescription() {
        String knownSkills = "Patient triage, Vital signs monitoring, Electronic Health Records, CPR certified";
        String jdText = "Job Title: Registered Staff Nurse\n" +
                "Company: City General Hospital\n" +
                "Key Responsibilities:\n" +
                "- Patient triage and vital signs monitoring\n" +
                "- IV medication administration and dosage calculations\n" +
                "- Electronic Health Records documentation (Epic)\n" +
                "- Wound care management and dressing changes\n" +
                "- Multidisciplinary clinical team collaboration";

        JdSkillGapAnalysisResponse response = engine.analyzeJd(knownSkills, jdText, null, null);

        assertNotNull(response);
        assertEquals("Registered Staff Nurse", response.getTargetRole());
        assertEquals("City General Hospital", response.getTargetCompany());
        assertFalse(response.isHasDomainMismatch(), "Candidate nursing skills match nursing role domain");
        assertTrue(response.getRequiredSkills().size() >= 4, "Should extract at least 4 dynamic bullet requirements");
        assertTrue(response.getMatchedSkills().stream().anyMatch(m -> m.toLowerCase().contains("triage") || m.toLowerCase().contains("vital")),
                "Should match triage and vital signs");
        assertTrue(response.getGapSkills().stream().anyMatch(g -> g.toLowerCase().contains("iv") || g.toLowerCase().contains("wound")),
                "Should identify IV administration and wound care as gaps");
    }

    @Test
    @DisplayName("Should dynamically extract novel engineering domain (e.g. Electrical Hardware Engineer)")
    void testArbitraryElectricalHardwareJobDescription() {
        String knownSkills = "PCB Design, Altium Designer, Soldering, Circuit Simulation";
        String jdText = "Role: Hardware Electrical Engineer\n" +
                "Company: NextGen Avionics Systems\n" +
                "Requirements:\n" +
                "- Multilayer PCB Design with Altium Designer\n" +
                "- High-speed digital circuit simulation with SPICE\n" +
                "- Microcontroller firmware development (ARM Cortex-M in C)\n" +
                "- Oscilloscope and logic analyzer hardware debugging\n" +
                "- EMI and EMC compliance testing standards";

        JdSkillGapAnalysisResponse response = engine.analyzeJd(knownSkills, jdText, null, null);

        assertNotNull(response);
        assertEquals("Hardware Electrical Engineer", response.getTargetRole());
        assertEquals("NextGen Avionics Systems", response.getTargetCompany());
        assertTrue(response.getMatchedSkills().stream().anyMatch(m -> m.toLowerCase().contains("pcb") || m.toLowerCase().contains("circuit")),
                "Should match PCB / circuit competencies");
        assertTrue(response.getGapSkills().stream().anyMatch(g -> g.toLowerCase().contains("microcontroller") || g.toLowerCase().contains("emc") || g.toLowerCase().contains("oscilloscope")),
                "Should extract firmware/EMC/debugging as gaps");
    }
}
