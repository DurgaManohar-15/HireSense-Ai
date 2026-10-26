package com.hiresense.modules.ai;

import com.hiresense.modules.assistant.dto.CareerAssistantDtos.MessageDto;
import java.util.List;

public class CareerAssistantPromptTemplate {

    public static final String PROMPT_VERSION = "v1.0.0";

    public static final String SYSTEM_INSTRUCTION = """
You are HireSense AI's Career Intelligence Advisor, an elite placement coach, technical mentor, and AI career guidance advisor for university engineering students.

YOUR ROLE & TONE:
1. Act like a highly knowledgeable, articulate, encouraging, and intelligent AI companion (like Gemini/ChatGPT).
2. Answer WHATEVER prompt or question the student asks:
   - Greetings & chit-chat: Respond warmly, introduce yourself, and orient the student toward placement readiness.
   - Conceptual CS & Coding queries (Data Structures, Algorithms, System Design, Java, Python, SQL, Web Dev, Cloud): Explain concepts thoroughly with clear structures, examples, or code snippets.
   - Placement & Interview strategies: Provide tailored advice for specific companies (e.g., Google, Amazon, Microsoft, TCS, Infosys) and interview rounds (Online Assessment, Technical Round 1/2, System Design, HR/Behavioral STAR method).
   - Personalized Readiness & PRS score questions: Reference their Placement Readiness Score (PRS), confidence index, identified skill gaps, and roadmap progress from the student context below.
   - Resume & Project Guidance: Give actionable advice on how to showcase projects, use strong impact metrics, and optimize for ATS parsability.
3. OUTPUT REQUIREMENT: Output MUST strictly be valid JSON conforming to the schema below. Do not wrap in additional text outside the JSON.

REQUIRED JSON SCHEMA:
{
  "assistantReply": "<string: Comprehensive, rich markdown-formatted answer with clear paragraphs, bullet points, or code blocks as needed>",
  "evidenceSources": ["<string: List of 1-3 sources/contexts consulted, e.g. 'Placement Readiness Intelligence', 'Gemini AI Intelligence', 'Preparation Roadmap', 'Skill Gap Engine'>"],
  "actionSuggestions": ["<string: 2-3 concise, high-impact actionable recommendations for the student>"]
}
""";

    public static String buildPrompt(
            String userMessage,
            String targetRole,
            String targetCompany,
            int prsScore,
            int confidence,
            String readinessBand,
            String strongestArea,
            String biggestOpportunity,
            List<String> topGaps,
            String roadmapProgress,
            List<MessageDto> recentHistory
    ) {
        StringBuilder sb = new StringBuilder();
        sb.append("[CANDIDATE PLACEMENT CONTEXT]\n");
        sb.append("Target Role: ").append(targetRole != null ? targetRole : "Software Engineer").append("\n");
        sb.append("Target Company / Tier: ").append(targetCompany != null ? targetCompany : "General Industry").append("\n");
        sb.append("Placement Readiness Score (PRS): ").append(prsScore).append("/100 (Band: ").append(readinessBand != null ? readinessBand : "Initial").append(")\n");
        sb.append("Assessment Confidence Index: ").append(confidence).append("%\n");
        sb.append("Verified Strongest Dimension: ").append(strongestArea != null ? strongestArea : "Technical Foundation").append("\n");
        sb.append("Primary Improvement Focus: ").append(biggestOpportunity != null ? biggestOpportunity : "Core Problem Solving").append("\n");
        sb.append("Active Skill Gaps: ").append(topGaps != null && !topGaps.isEmpty() ? String.join(", ", topGaps) : "None registered").append("\n");
        sb.append("Preparation Roadmap Progress: ").append(roadmapProgress != null ? roadmapProgress : "0/0").append("\n\n");

        if (recentHistory != null && !recentHistory.isEmpty()) {
            sb.append("[RECENT CONVERSATION HISTORY]\n");
            for (MessageDto msg : recentHistory) {
                String sender = "USER".equalsIgnoreCase(msg.getSenderType()) ? "Student" : "Career Advisor";
                sb.append(sender).append(": ").append(msg.getMessageText()).append("\n");
            }
            sb.append("\n");
        }

        sb.append("[STUDENT CURRENT MESSAGE / PROMPT]\n");
        sb.append(userMessage).append("\n\n");
        sb.append("Synthesize the student context and query, then return your comprehensive advisory response in the required JSON format.");

        return sb.toString();
    }
}
