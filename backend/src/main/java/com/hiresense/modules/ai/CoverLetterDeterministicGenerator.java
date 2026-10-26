package com.hiresense.modules.ai;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class CoverLetterDeterministicGenerator {

    public static String generate(
            String candidateName,
            String candidateEmail,
            String candidatePhone,
            String companyName,
            String roleTitle,
            String jobDescription,
            String resumeText,
            String tone,
            String additionalInstructions,
            String candidateSkills,
            String degree,
            String college
    ) {
        String name = (candidateName != null && !candidateName.isBlank()) ? candidateName.trim() : "Candidate";
        String company = (companyName != null && !companyName.isBlank()) ? companyName.trim() : "Hiring Organization";
        String role = (roleTitle != null && !roleTitle.isBlank()) ? roleTitle.trim() : "Software Engineer";
        String deg = (degree != null && !degree.isBlank()) ? degree.trim() : "Computer Science & Engineering";
        String inst = (college != null && !college.isBlank()) ? college.trim() : "University";
        String skills = (candidateSkills != null && !candidateSkills.isBlank()) ? candidateSkills.trim() : "Java, Spring Boot, React, SQL, Cloud Architecture";
        String toneStr = (tone != null) ? tone.toUpperCase().trim() : "PROFESSIONAL";

        StringBuilder sb = new StringBuilder();

        // 1. Candidate Header
        sb.append(name).append("\n");
        if (candidateEmail != null && !candidateEmail.isBlank()) sb.append(candidateEmail.trim());
        if (candidatePhone != null && !candidatePhone.isBlank()) {
            if (candidateEmail != null && !candidateEmail.isBlank()) sb.append(" | ");
            sb.append(candidatePhone.trim());
        }
        sb.append("\n\n");

        // 2. Date
        sb.append("Date: ").append(LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM d, yyyy"))).append("\n\n");

        // 3. Recipient Block
        sb.append("To,\nThe Hiring Manager & Talent Acquisition Team\n");
        sb.append(company).append("\n\n");

        // 4. Subject Line
        sb.append("Subject: Application for the Position of ").append(role).append(" - ").append(name).append("\n\n");

        // 5. Salutation
        sb.append("Dear Hiring Team at ").append(company).append(",\n\n");

        // 6. Opening Paragraph (Tone-aware)
        if ("CONVERSATIONAL".equals(toneStr)) {
            sb.append("I am excited to submit my application for the ").append(role).append(" position at ").append(company)
              .append(". Having closely tracked ").append(company).append("'s engineering innovations, customer impact, and technological growth, ")
              .append("I would love the opportunity to contribute my problem-solving background in ").append(skills)
              .append(" to your forward-thinking engineering team.\n\n");
        } else if ("IMPACT_DRIVEN".equals(toneStr)) {
            sb.append("I am writing to present my strong candidacy for the ").append(role).append(" role at ").append(company)
              .append(". Backed by a rigorous foundation in ").append(deg).append(" from ").append(inst)
              .append(" and demonstrated hands-on technical execution across ").append(skills)
              .append(", I am driven to deliver scalable, reliable, and high-performance software solutions from day one.\n\n");
        } else if ("EXECUTIVE".equals(toneStr)) {
            sb.append("It is with distinct enthusiasm that I submit my credentials for the ").append(role).append(" opening at ").append(company)
              .append(". As a proactive developer graduating in ").append(deg).append(" from ").append(inst)
              .append(", I combine systemic technical depth with disciplined engineering practices to deliver impactful digital solutions.\n\n");
        } else {
            // PROFESSIONAL default
            sb.append("I am writing to express my enthusiastic interest in the ").append(role).append(" position currently available at ").append(company)
              .append(". With a solid academic foundation in ").append(deg).append(" from ").append(inst)
              .append(" and proven project competencies in ").append(skills)
              .append(", I am eager to contribute meaningfully to your esteemed development initiatives.\n\n");
        }

        // 7. Technical & Achievement Alignment Paragraph (integrating Resume & JD)
        sb.append("Throughout my academic journey, collaborative projects, and hands-on coding endeavors, I have cultivated specialized proficiency in ")
          .append(skills).append(". ");

        if (resumeText != null && !resumeText.isBlank()) {
            sb.append("As reflected in my resume, I have consistently emphasized writing modular, maintainable code, implementing robust data structures, ")
              .append("and architecting responsive, end-to-end full-stack capabilities that solve tangible user problems under agile sprints. ");
        } else {
            sb.append("My project portfolio highlights a disciplined approach to developing resilient architectures, applying core CS principles, ")
              .append("and optimizing system performance across iterative release cycles. ");
        }

        if (jobDescription != null && !jobDescription.isBlank()) {
            sb.append("Reviewing the expectations outlined in your job requirements, I am confident that my technical toolkit, analytical problem-solving skills, ")
              .append("and dedication to continuous technical excellence align seamlessly with the responsibilities of the ").append(role).append(" role.\n\n");
        } else {
            sb.append("I am particularly drawn to this role because it directly exercises both my architectural thinking and hands-on execution capabilities.\n\n");
        }

        // 8. Custom Add-On Highlights Paragraph (if provided by candidate)
        if (additionalInstructions != null && !additionalInstructions.isBlank()) {
            sb.append("In particular, I would like to highlight: ")
              .append(additionalInstructions.trim()).append(". ")
              .append("This background has reinforced my adaptability, collaborative execution, and commitment to delivering measurable results in high-velocity engineering environments.\n\n");
        }

        // 9. Company Mission & Cultural Resonance
        sb.append("What distinguishes ").append(company).append(" for me is your dedication to setting high engineering benchmarks, nurturing talent, ")
          .append("and building products that create lasting value. I welcome the opportunity to bring my analytical rigor, proactive curiosity, ")
          .append("and collaborative mindset to support your ongoing and future technical milestones.\n\n");

        // 10. Call to Action & Sign-off
        sb.append("Thank you for your time, consideration, and review of my application. I would welcome the opportunity to speak with your team in an interview to discuss how my competencies can best serve ").append(company).append(".\n\n");
        sb.append("Sincerely,\n\n");
        sb.append(name);

        return sb.toString();
    }
}
