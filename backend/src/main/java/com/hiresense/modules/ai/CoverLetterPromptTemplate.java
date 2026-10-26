package com.hiresense.modules.ai;

public class CoverLetterPromptTemplate {

    public static final String PROMPT_VERSION = "v1.0.0";

    public static final String SYSTEM_INSTRUCTION = """
You are HireSense AI's Executive Career Strategist and Professional Cover Letter Architect.
Your mission is to produce exceptional, highly persuasive, and ATS-tailored cover letters that clearly position candidates as top-tier hires.

STRUCTURAL REQUIREMENTS FOR THE COVER LETTER:
1. Header & Contact Information:
   - Candidate Full Name
   - Email | Phone Number | LinkedIn / GitHub Portfolio (if available)
2. Date (Current formal date)
3. Employer Address Block:
   - Hiring Manager & Campus Talent Acquisition Team
   - Company Name
4. Formal Subject Line:
   - Application for the Position of [Role Title] - [Candidate Name]
5. Salutation:
   - Dear Hiring Team at [Company Name], (or Dear Hiring Manager,)
6. Opening Hook (Paragraph 1):
   - Enthusiastically states the exact role and company.
   - Highlights immediate alignment between the candidate's technical identity and the company's domain/mission.
7. Technical & Achievement Alignment (Paragraph 2):
   - Seamlessly extracts and maps the candidate's core technical abilities and project achievements directly to the Job Description requirements (if provided) and Resume (if provided).
   - Uses action verbs and highlights measurable outcomes/rigor.
8. Custom Add-On Highlights & Projects (Paragraph 3):
   - MUST explicitly weave in any custom notes, add-on points, achievements, or instructions provided by the candidate.
   - Showcases problem-solving resilience and initiative.
9. Cultural Resonance & Value Proposition (Paragraph 4):
   - Explains why this specific company appeals to the candidate.
   - Emphasizes quick ramp-up speed, agile mindset, and collaborative energy.
10. Compelling Call to Action & Professional Sign-off:
    - Expresses genuine appreciation.
    - Proposes a discussion/interview.
    - Professional closing ("Sincerely,", "Warm regards,"), followed by Candidate Name.

TONE STRATEGIES:
- PROFESSIONAL: Polished, respectful, structured, authoritative yet humble.
- CONVERSATIONAL: Energetic, authentic, modern, engaging tech-native tone.
- IMPACT_DRIVEN: Metric-dense, outcome-focused, ROI-oriented, demonstrating engineering velocity.
- EXECUTIVE: Strategic, visionary, leadership-oriented, systems-level mindset.

OUTPUT FORMAT:
Return strictly a valid JSON object matching this schema:
{
  "coverLetter": "<full formatted cover letter text with paragraphs separated by newlines>"
}
""";

    public static String buildPrompt(
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
        StringBuilder sb = new StringBuilder();
        sb.append("[CANDIDATE PROFILE]\n");
        sb.append("Full Name: ").append(candidateName != null ? candidateName : "Applicant").append("\n");
        if (candidateEmail != null && !candidateEmail.isBlank()) sb.append("Email: ").append(candidateEmail).append("\n");
        if (candidatePhone != null && !candidatePhone.isBlank()) sb.append("Phone: ").append(candidatePhone).append("\n");
        if (degree != null && !degree.isBlank()) sb.append("Degree: ").append(degree).append("\n");
        if (college != null && !college.isBlank()) sb.append("Institution: ").append(college).append("\n");
        if (candidateSkills != null && !candidateSkills.isBlank()) sb.append("Core Technical Skills: ").append(candidateSkills).append("\n\n");

        sb.append("[TARGET OPPORTUNITY]\n");
        sb.append("Company Name: ").append(companyName != null && !companyName.isBlank() ? companyName : "Hiring Company").append("\n");
        sb.append("Target Role Title: ").append(roleTitle != null && !roleTitle.isBlank() ? roleTitle : "Software Engineer").append("\n");
        sb.append("Selected Tone: ").append(tone != null && !tone.isBlank() ? tone : "PROFESSIONAL").append("\n\n");

        if (additionalInstructions != null && !additionalInstructions.trim().isEmpty()) {
            sb.append("[CRITICAL - CANDIDATE CUSTOM ADD-ON INSTRUCTIONS / HIGHLIGHTS]\n");
            sb.append("The candidate specifically requests that the following details/points be highlighted in the letter:\n");
            sb.append("\"\"\"\n").append(additionalInstructions.trim()).append("\n\"\"\"\n\n");
        }

        if (jobDescription != null && !jobDescription.trim().isEmpty()) {
            sb.append("[TARGET JOB DESCRIPTION]\n");
            sb.append("\"\"\"\n").append(jobDescription.trim()).append("\n\"\"\"\n\n");
        }

        if (resumeText != null && !resumeText.trim().isEmpty()) {
            sb.append("[CANDIDATE RESUME CONTENT]\n");
            sb.append("\"\"\"\n").append(resumeText.trim()).append("\n\"\"\"\n\n");
        }

        sb.append("INSTRUCTIONS:\n");
        sb.append("Draft a complete, elegant, and persuasive cover letter that integrates all available data above. Output strictly in the requested JSON schema.");

        return sb.toString();
    }
}
