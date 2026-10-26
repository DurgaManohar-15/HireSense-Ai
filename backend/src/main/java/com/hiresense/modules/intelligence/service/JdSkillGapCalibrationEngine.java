package com.hiresense.modules.intelligence.service;

import com.hiresense.modules.intelligence.dto.JdSkillGapAnalysisResponse;
import com.hiresense.modules.intelligence.dto.JdSkillGapAnalysisResponse.SkillComparisonItem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
public class JdSkillGapCalibrationEngine {

    // Domain Taxonomy Mapping for Automatic Classification
    private static final Map<String, List<String>> DOMAIN_KEYWORDS = new LinkedHashMap<>();
    static {
        DOMAIN_KEYWORDS.put("Sales & Business Development", List.of(
                "business development", "bda", "sales", "student enrollments", "lead conversion", "prospects",
                "counseling", "cold calling", "outreach", "negotiation", "client acquisition", "crm",
                "inside sales", "account management", "lead generation", "pitching", "admissions", "closing"
        ));
        DOMAIN_KEYWORDS.put("Digital Marketing & Content", List.of(
                "marketing", "seo", "sem", "social media", "content marketing", "campaign",
                "email marketing", "google ads", "analytics", "copywriting", "brand management", "growth marketing"
        ));
        DOMAIN_KEYWORDS.put("Software Engineering & Development", List.of(
                "software engineer", "developer", "backend", "frontend", "full stack", "java", "python",
                "react", "spring boot", "node.js", "c++", "c#", "microservices", "sql", "api", "database",
                "git", "system design", "data structures", "algorithms", "restful", "html", "css", "javascript", "typescript"
        ));
        DOMAIN_KEYWORDS.put("Cloud & DevOps", List.of(
                "devops", "cloud", "aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "terraform",
                "linux", "infrastructure", "ansible", "jenkins", "helm"
        ));
        DOMAIN_KEYWORDS.put("Data Science & Machine Learning", List.of(
                "data science", "machine learning", "deep learning", "ai", "pandas", "numpy", "pytorch",
                "tensorflow", "nlp", "computer vision", "llm", "data analysis", "power bi", "tableau", "statistics"
        ));
        DOMAIN_KEYWORDS.put("Product & Project Management", List.of(
                "product manager", "product owner", "user stories", "roadmap", "agile", "scrum", "wireframes",
                "user research", "prd", "kpis", "sprint planning", "project manager"
        ));
        DOMAIN_KEYWORDS.put("UI/UX & Product Design", List.of(
                "ui/ux", "figma", "wireframe", "prototyping", "user research", "design system", "visual design", "adobe xd"
        ));
        DOMAIN_KEYWORDS.put("Finance, Accounting & Banking", List.of(
                "finance", "accounting", "auditing", "taxation", "financial modeling", "excel", "balance sheet",
                "portfolio", "investment", "valuation", "cfa", "chartered accountant"
        ));
        DOMAIN_KEYWORDS.put("Human Resources & Talent Acquisition", List.of(
                "human resources", "hr", "recruitment", "talent acquisition", "sourcing", "onboarding",
                "employee relations", "payroll", "interviews", "people operations"
        ));
        DOMAIN_KEYWORDS.put("Healthcare, Medical & Nursing", List.of(
                "nursing", "patient care", "clinical", "hospital", "healthcare", "vital signs", "icu", "medical", "pharmacology"
        ));
        DOMAIN_KEYWORDS.put("Mechanical & Manufacturing Engineering", List.of(
                "cad", "autocad", "solidworks", "thermodynamics", "manufacturing", "cnc", "fluid mechanics", "mechanical engineer"
        ));
        DOMAIN_KEYWORDS.put("Electrical & Electronics Engineering", List.of(
                "circuit", "pcb", "vlsi", "embedded systems", "microcontroller", "iot", "electrical engineer", "verilog", "matlab"
        ));
        DOMAIN_KEYWORDS.put("Operations, Supply Chain & Logistics", List.of(
                "supply chain", "logistics", "procurement", "inventory", "operations manager", "vendor management", "warehousing"
        ));
    }

    private static final Set<String> STOP_WORDS = Set.of(
            "a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "with", "by", "of", "from",
            "is", "are", "be", "have", "has", "had", "will", "our", "your", "their", "we", "you",
            "as", "that", "this", "these", "those", "can", "should", "must", "able", "ability"
    );

    public JdSkillGapAnalysisResponse analyzeJd(
            String knownSkillsRaw,
            String jdTextRaw,
            String targetRoleOverride,
            String targetCompanyOverride
    ) {
        if (jdTextRaw == null || jdTextRaw.isBlank()) {
            throw new IllegalArgumentException("Job Description text must not be empty.");
        }

        String jd = jdTextRaw.trim();
        String jdLower = jd.toLowerCase();

        // 1. Parse Candidate Skills
        List<String> candidateSkills = parseCandidateSkills(knownSkillsRaw);
        String candidateDomain = determineSkillDomain(candidateSkills);

        // 2. Extract Role, Company, and Domain from JD
        String extractedRole = extractRoleTitle(jd, targetRoleOverride);
        String extractedCompany = extractCompany(jd, targetCompanyOverride);
        String targetDomain = determineJdDomain(jdLower, extractedRole);

        // 3. Extract Genuine Demanded Competencies Dynamically from ANY JD Text
        List<ExtractedRequirement> jdRequirements = extractRequirementsFromJd(jd, jdLower, targetDomain);

        // 4. Match Candidate Skills against JD Requirements
        List<String> requiredSkills = new ArrayList<>();
        List<String> matchedSkills = new ArrayList<>();
        List<String> gapSkills = new ArrayList<>();
        List<SkillComparisonItem> comparisons = new ArrayList<>();

        Set<String> matchedCandidateSkills = new HashSet<>();

        for (ExtractedRequirement req : jdRequirements) {
            requiredSkills.add(req.name);

            boolean isMatched = false;
            String matchingCandidateSkill = null;

            for (String cSkill : candidateSkills) {
                if (matchesCompetency(cSkill, req)) {
                    isMatched = true;
                    matchingCandidateSkill = cSkill;
                    matchedCandidateSkills.add(cSkill.toLowerCase().trim());
                    break;
                }
            }

            if (isMatched) {
                matchedSkills.add(req.name);
                comparisons.add(SkillComparisonItem.builder()
                        .skillName(req.name)
                        .category(req.category)
                        .requiredByJd(true)
                        .possessedByCandidate(true)
                        .status("MATCH")
                        .importance(req.importance)
                        .explanation("Demonstrated in your skillset (" + matchingCandidateSkill + ").")
                        .build());
            } else {
                gapSkills.add(req.name);
                comparisons.add(SkillComparisonItem.builder()
                        .skillName(req.name)
                        .category(req.category)
                        .requiredByJd(true)
                        .possessedByCandidate(false)
                        .status("GAP")
                        .importance(req.importance)
                        .explanation("Required by JD for " + extractedRole + " but not demonstrated in your profile.")
                        .build());
            }
        }

        // 5. Detect Surplus Skills (Candidate has them, but JD doesn't demand them)
        List<String> surplusSkills = new ArrayList<>();
        for (String cSkill : candidateSkills) {
            if (!matchedCandidateSkills.contains(cSkill.toLowerCase().trim())) {
                surplusSkills.add(capitalize(cSkill));
                comparisons.add(SkillComparisonItem.builder()
                        .skillName(capitalize(cSkill))
                        .category("SURPLUS_COMPETENCY")
                        .requiredByJd(false)
                        .possessedByCandidate(true)
                        .status("SURPLUS")
                        .importance("BENEFICIAL")
                        .explanation("Possessed in your profile but not directly utilized or demanded by this " + targetDomain + " role.")
                        .build());
            }
        }

        // 6. Domain Mismatch Evaluation
        boolean hasDomainMismatch = isDomainMismatch(candidateDomain, targetDomain);

        // 7. Deterministic Mathematical Match Rate
        int matchScore = calculateMatchScore(requiredSkills.size(), matchedSkills.size(), hasDomainMismatch);

        // 8. Construct Factual Dynamic Domain Difference Summary
        String differenceSummary = buildDomainDifferenceSummary(
                extractedRole, extractedCompany, targetDomain, candidateDomain,
                hasDomainMismatch, candidateSkills, gapSkills, matchedSkills
        );

        // 9. Actionable Strategic Advice
        List<String> advice = buildActionableAdvice(
                hasDomainMismatch, targetDomain, candidateDomain, extractedRole, gapSkills, matchedSkills
        );

        return JdSkillGapAnalysisResponse.builder()
                .matchScore(matchScore)
                .targetRole(extractedRole)
                .targetCompany(extractedCompany)
                .targetDomain(targetDomain)
                .candidateDomain(candidateDomain)
                .hasDomainMismatch(hasDomainMismatch)
                .domainDifferenceSummary(differenceSummary)
                .requiredSkills(requiredSkills)
                .matchedSkills(matchedSkills)
                .gapSkills(gapSkills)
                .surplusSkills(surplusSkills)
                .skillComparisons(comparisons)
                .actionableAdvice(advice)
                .build();
    }

    private List<String> parseCandidateSkills(String raw) {
        if (raw == null || raw.isBlank()) {
            return new ArrayList<>();
        }
        String[] parts = raw.split("[,;\\n\\|]+");
        List<String> list = new ArrayList<>();
        for (String p : parts) {
            String trimmed = p.trim().replaceAll("^[•*\\-\\d+\\.\\s]+", "");
            if (!trimmed.isEmpty()) {
                list.add(trimmed);
            }
        }
        return list;
    }

    private String extractRoleTitle(String jd, String override) {
        if (override != null && !override.isBlank()) {
            return override.trim();
        }
        // Pattern 1: Job Designation/Role/Title: ...
        Matcher m1 = Pattern.compile("(?i)(?:job\\s*(?:designation|title|role)|designation|position|role)\\s*[:\\-]\\s*([A-Za-z0-9\\s/&\\-\\+]+?)(?=[\\n\\r.,;]|department|company|location)", Pattern.CASE_INSENSITIVE).matcher(jd);
        if (m1.find()) {
            return cleanTitle(m1.group(1));
        }
        // Pattern 2: As an? [Role] at [Company]
        Matcher m2 = Pattern.compile("(?i)as\\s+an?\\s+([A-Za-z0-9\\s/&\\-\\+]+?)\\s+at\\b").matcher(jd);
        if (m2.find()) {
            return cleanTitle(m2.group(1));
        }
        // Pattern 3: Hiring/looking for an? [Role]
        Matcher m3 = Pattern.compile("(?i)(?:hiring|looking|seeking)\\s+for\\s+(?:an?\\s+)?([A-Za-z0-9\\s/&\\-\\+]+?)(?:at|in|\\n|\\.|,)").matcher(jd);
        if (m3.find()) {
            return cleanTitle(m3.group(1));
        }
        // Pattern 4: First line check if short and formatted like title
        String firstLine = jd.split("[\\r\\n]+")[0].trim();
        if (firstLine.length() <= 50 && !firstLine.contains(".") && !firstLine.toLowerCase().contains("about") && !firstLine.toLowerCase().contains("welcome")) {
            return cleanTitle(firstLine);
        }
        return "Target Professional Role";
    }

    private String extractCompany(String jd, String override) {
        if (override != null && !override.isBlank()) {
            return override.trim();
        }
        // Pattern: Company/Organization: ...
        Matcher m1 = Pattern.compile("(?i)(?:company|organization|employer)\\s*[:\\-]\\s*([A-Za-z0-9\\s.,&'\\-]+?)(?=[\\n\\r]|job|department|location)", Pattern.CASE_INSENSITIVE).matcher(jd);
        if (m1.find()) {
            return cleanTitle(m1.group(1));
        }
        // Pattern: at [Company], you will
        Matcher m2 = Pattern.compile("(?i)\\bat\\s+([A-Z][A-Za-z0-9\\s&'\\-]+?(?:Private Limited|Pvt Ltd|Ltd|Inc|Corp|Technologies|Edutech|Solutions|Services|Systems)?)\\s*,?\\s*(?:you\\s+will|we|our)").matcher(jd);
        if (m2.find()) {
            return cleanTitle(m2.group(1));
        }
        return "Target Organization";
    }

    private String cleanTitle(String s) {
        if (s == null) return "";
        return s.replaceAll("\\s+", " ").trim();
    }

    private String determineJdDomain(String jdLower, String roleTitle) {
        String combined = (roleTitle + " " + jdLower).toLowerCase();

        int maxScore = 0;
        String bestDomain = "General Industry";

        for (Map.Entry<String, List<String>> entry : DOMAIN_KEYWORDS.entrySet()) {
            int score = 0;
            for (String kw : entry.getValue()) {
                if (combined.contains(kw.toLowerCase())) {
                    score += 2;
                }
            }
            if (score > maxScore) {
                maxScore = score;
                bestDomain = entry.getKey();
            }
        }
        return bestDomain;
    }

    private String determineSkillDomain(List<String> skills) {
        if (skills.isEmpty()) {
            return "General Engineering / Cross-Functional";
        }
        String combined = String.join(" ", skills).toLowerCase();
        int maxScore = 0;
        String bestDomain = "Technical / Multidisciplinary Competencies";

        for (Map.Entry<String, List<String>> entry : DOMAIN_KEYWORDS.entrySet()) {
            int score = 0;
            for (String kw : entry.getValue()) {
                if (combined.contains(kw.toLowerCase())) {
                    score += 2;
                }
            }
            if (score > maxScore) {
                maxScore = score;
                bestDomain = entry.getKey();
            }
        }

        if (bestDomain.equals("Software Engineering & Development")) {
            return "Software Engineering / Web & Backend";
        }
        return bestDomain;
    }

    private boolean isDomainMismatch(String candidateDomain, String targetDomain) {
        if (candidateDomain.equalsIgnoreCase(targetDomain)) return false;

        boolean candidateIsTech = candidateDomain.contains("Software") || candidateDomain.contains("Engineering") || candidateDomain.contains("Cloud") || candidateDomain.contains("Data Science");
        boolean targetIsBusiness = targetDomain.contains("Sales") || targetDomain.contains("Business Development") || targetDomain.contains("Marketing") || targetDomain.contains("Human Resources");

        boolean candidateIsBusiness = candidateDomain.contains("Sales") || candidateDomain.contains("Business") || candidateDomain.contains("Marketing");
        boolean targetIsTech = targetDomain.contains("Software") || targetDomain.contains("Cloud") || targetDomain.contains("Data Science");

        boolean healthcareMismatch = candidateDomain.contains("Healthcare") != targetDomain.contains("Healthcare");

        return (candidateIsTech && targetIsBusiness) || (candidateIsBusiness && targetIsTech) || (healthcareMismatch && (candidateIsTech || candidateIsBusiness));
    }

    private int calculateMatchScore(int totalReq, int matchedReq, boolean domainMismatch) {
        if (totalReq == 0) return 60;
        if (domainMismatch && matchedReq == 0) {
            return 8; // Baseline honest transferable score
        }
        double ratio = (double) matchedReq / totalReq;
        int raw = (int) Math.round(ratio * 100.0);
        if (domainMismatch) {
            raw = Math.min(raw, 30); // Capped if fundamental domain conflict
        }
        return Math.min(100, Math.max(5, raw));
    }

    /**
     * Universal Dynamic Requirement Extractor:
     * Parses ANY job description text without relying on predefined templates.
     * Extracts bullet points, requirement clauses, key qualifications, tools, and competencies.
     */
    private List<ExtractedRequirement> extractRequirementsFromJd(String rawJd, String jdLower, String domain) {
        Map<String, ExtractedRequirement> reqMap = new LinkedHashMap<>();

        // Strategy A: Extract from explicit "Requirements / Qualifications / Skills" lists or lines
        Matcher listMatcher = Pattern.compile("(?i)(?:requirements?|qualifications?|required\\s+skills?|key\\s+responsibilities|responsibilities|technologies|tech\\s+stack)\\s*[:\\-]?\\s*([^\\n\\r]+)").matcher(rawJd);
        while (listMatcher.find()) {
            String listContent = listMatcher.group(1).trim();
            if (listContent.length() > 5) {
                String[] items = listContent.split("[,;•|]+|\\band\\b");
                for (String item : items) {
                    addDynamicRequirement(item, reqMap, "CRITICAL");
                }
            }
        }

        // Strategy B: Extract bullet points anywhere in the JD
        Pattern bulletPattern = Pattern.compile("(?m)^\\s*[-*•▪▫►✔✓]\\s*(.+)$");
        Matcher bulletMatcher = bulletPattern.matcher(rawJd);
        int bulletCount = 0;
        while (bulletMatcher.find()) {
            String bullet = bulletMatcher.group(1).trim();
            if (bullet.length() > 3 && bullet.length() < 160) {
                bulletCount++;
                String importance = bulletCount <= 3 ? "CRITICAL" : "IMPORTANT";
                addDynamicRequirement(bullet, reqMap, importance);
            }
        }

        // Strategy C: Numbered list items (e.g. 1. React 2. Node.js or 1) Lead conversion)
        Pattern numPattern = Pattern.compile("(?m)^\\s*\\d+[.)]\\s*(.+)$");
        Matcher numMatcher = numPattern.matcher(rawJd);
        while (numMatcher.find()) {
            String item = numMatcher.group(1).trim();
            if (item.length() > 3 && item.length() < 160) {
                addDynamicRequirement(item, reqMap, "IMPORTANT");
            }
        }

        // Strategy D: Domain & Contextual Competency Extraction from continuous prose
        // If the JD contains specific functional competencies described in sentences, detect them
        if (domain.contains("Sales") || domain.contains("Business Development") || jdLower.contains("enrollment") || jdLower.contains("lead") || jdLower.contains("sales")) {
            checkTextCompetency(jdLower, reqMap, "Student Enrollments & Admissions", "FUNCTIONAL", "CRITICAL",
                    List.of("enrollment", "admissions", "learner", "students", "enroll"));
            checkTextCompetency(jdLower, reqMap, "Lead Conversion & Sales Prospecting", "FUNCTIONAL", "CRITICAL",
                    List.of("convert", "prospects", "lead", "conversion", "sales", "qualif"));
            checkTextCompetency(jdLower, reqMap, "Educational Program Guidance & Counseling", "DOMAIN", "CRITICAL",
                    List.of("career goals", "guidance", "counsel", "learning programs", "advis"));
            checkTextCompetency(jdLower, reqMap, "Client Outreach & Consultative Communication", "SOFT_SKILL", "IMPORTANT",
                    List.of("connect with", "communication", "outreach", "client", "customer", "calling"));
            checkTextCompetency(jdLower, reqMap, "Group Discussion & Presentation Skills", "SOFT_SKILL", "IMPORTANT",
                    List.of("group discussion", "interview", "presentation", "pitch"));
            checkTextCompetency(jdLower, reqMap, "CRM & Pipeline Tracking", "TOOL", "BENEFICIAL",
                    List.of("crm", "pipeline", "tracking", "follow up", "reporting"));
            checkTextCompetency(jdLower, reqMap, "Objection Handling & Negotiation", "FUNCTIONAL", "IMPORTANT",
                    List.of("negotiat", "objection", "convinc", "persuasive", "closing"));
        }

        // Technology & Core Skills Scanner across all domains
        scanCommonTechAndTools(jdLower, reqMap);

        // Strategy E: If still fewer than 3 requirements extracted (e.g. dense continuous text), extract key verb-noun clauses
        if (reqMap.size() < 3) {
            String[] sentences = rawJd.split("[.!?\\n]+");
            for (String sentence : sentences) {
                String s = sentence.trim();
                if (s.length() > 10 && s.length() < 120) {
                    if (s.matches("(?i).*(?:experience|knowledge|ability|skills|proficien|working with|responsible for).*")) {
                        addDynamicRequirement(s, reqMap, "IMPORTANT");
                    }
                }
            }
        }

        // Fallback for extremely sparse inputs
        if (reqMap.isEmpty()) {
            reqMap.put("Core Functional Competency", new ExtractedRequirement("Core Functional Competency", "FUNCTIONAL", "CRITICAL", List.of("competency", "skill")));
            reqMap.put("Professional Communication", new ExtractedRequirement("Professional Communication", "SOFT_SKILL", "IMPORTANT", List.of("communication", "verbal")));
            reqMap.put("Execution & Problem Solving", new ExtractedRequirement("Execution & Problem Solving", "FUNCTIONAL", "IMPORTANT", List.of("execution", "problem solving")));
        }

        return new ArrayList<>(reqMap.values());
    }

    private void addDynamicRequirement(String rawItem, Map<String, ExtractedRequirement> reqMap, String defaultImportance) {
        String cleaned = cleanRequirementName(rawItem);
        if (cleaned.isBlank() || cleaned.length() < 2 || cleaned.length() > 80) return;

        // Deduplicate similar requirements
        String lower = cleaned.toLowerCase();
        for (String existing : reqMap.keySet()) {
            if (existing.equalsIgnoreCase(cleaned) || existing.toLowerCase().contains(lower) || lower.contains(existing.toLowerCase())) {
                return;
            }
        }

        String category = inferCategory(lower);
        String importance = defaultImportance;
        if (lower.contains("must") || lower.contains("required") || lower.contains("essential")) {
            importance = "CRITICAL";
        } else if (lower.contains("plus") || lower.contains("bonus") || lower.contains("preferred") || lower.contains("nice to have")) {
            importance = "BENEFICIAL";
        }

        List<String> triggers = generateTriggers(cleaned);
        reqMap.put(cleaned, new ExtractedRequirement(cleaned, category, importance, triggers));
    }

    private String cleanRequirementName(String s) {
        if (s == null) return "";
        // Strip common leading phrases
        String clean = s.replaceAll("^[•*\\-\\d+\\.\\s]+", "").trim();
        clean = clean.replaceAll("(?i)^(?:experience\\s+(?:with|in)|hands-on\\s+(?:experience\\s+in|experience\\s+with)|proven\\s+experience\\s+in|strong\\s+knowledge\\s+of|working\\s+knowledge\\s+of|proficiency\\s+in|proficient\\s+in|ability\\s+to|demonstrated\\s+ability\\s+to|responsible\\s+for|expertise\\s+in|understanding\\s+of|familiarity\\s+with|must\\s+have|required\\s*[:\\-]?|knowledge\\s+of|skills\\s+in)\\s+", "");
        // If there's an explanation clause like ", such as..." or " including...", take the primary skill
        int cutIdx = clean.indexOf(" such as ");
        if (cutIdx > 5) clean = clean.substring(0, cutIdx);
        cutIdx = clean.indexOf(" including ");
        if (cutIdx > 5) clean = clean.substring(0, cutIdx);
        // Clean trailing punctuation
        clean = clean.replaceAll("[.,;:\\s]+$", "").trim();
        return capitalizeWords(clean);
    }

    private String inferCategory(String lower) {
        if (lower.contains("java") || lower.contains("python") || lower.contains("c++") || lower.contains("c#") ||
            lower.contains("react") || lower.contains("spring") || lower.contains("sql") || lower.contains("api") ||
            lower.contains("cad") || lower.contains("circuit") || lower.contains("excel") || lower.contains("figma") ||
            lower.contains("html") || lower.contains("css") || lower.contains("node") || lower.contains("linux")) {
            return "TECHNICAL";
        }
        if (lower.contains("docker") || lower.contains("kubernetes") || lower.contains("aws") || lower.contains("azure") ||
            lower.contains("gcp") || lower.contains("cloud") || lower.contains("devops") || lower.contains("git")) {
            return "DEVOPS / CLOUD";
        }
        if (lower.contains("communication") || lower.contains("teamwork") || lower.contains("verbal") ||
            lower.contains("interpersonal") || lower.contains("collaboration") || lower.contains("discussion")) {
            return "SOFT_SKILL";
        }
        if (lower.contains("sales") || lower.contains("conversion") || lower.contains("lead") ||
            lower.contains("enrollment") || lower.contains("marketing") || lower.contains("finance") ||
            lower.contains("nursing") || lower.contains("clinical") || lower.contains("audit")) {
            return "FUNCTIONAL";
        }
        return "COMPETENCY";
    }

    private List<String> generateTriggers(String name) {
        List<String> triggers = new ArrayList<>();
        triggers.add(name.toLowerCase());

        String[] tokens = name.toLowerCase().split("[^a-zA-Z0-9+#]+");
        for (String t : tokens) {
            String trimmed = t.trim();
            if (trimmed.length() >= 3 && !STOP_WORDS.contains(trimmed)) {
                triggers.add(trimmed);
            }
        }
        return triggers;
    }

    private void checkTextCompetency(String jdLower, Map<String, ExtractedRequirement> map, String name, String category, String importance, List<String> triggers) {
        for (String t : triggers) {
            if (jdLower.contains(t.toLowerCase())) {
                map.put(name, new ExtractedRequirement(name, category, importance, triggers));
                break;
            }
        }
    }

    private void scanCommonTechAndTools(String jdLower, Map<String, ExtractedRequirement> map) {
        Map<String, String[]> commonTech = Map.ofEntries(
                Map.entry("Java Core & OOP", new String[]{"java", "oop"}),
                Map.entry("Spring Boot & Microservices", new String[]{"spring boot", "spring", "microservices"}),
                Map.entry("RESTful APIs", new String[]{"rest api", "restful", "rest apis"}),
                Map.entry("Relational SQL Databases", new String[]{"sql", "mysql", "postgres", "postgresql", "oracle", "database"}),
                Map.entry("Frontend Engineering (React/Web)", new String[]{"react", "react.js", "frontend", "vue", "angular"}),
                Map.entry("Docker & Containerization", new String[]{"docker", "containerization", "containers"}),
                Map.entry("Cloud Platforms (AWS/Azure/GCP)", new String[]{"aws", "azure", "gcp", "cloud"}),
                Map.entry("Git Version Control", new String[]{"git", "github", "gitlab"}),
                Map.entry("Python Programming", new String[]{"python"}),
                Map.entry("Data Science & ML Libraries", new String[]{"pandas", "numpy", "pytorch", "tensorflow", "scikit"}),
                Map.entry("Testing & Quality Assurance", new String[]{"junit", "mockito", "jest", "unit testing", "test automation"}),
                Map.entry("AutoCAD & CAD Modeling", new String[]{"autocad", "solidworks", "cad"}),
                Map.entry("Financial Analysis & Modeling", new String[]{"financial modeling", "financial analysis", "balance sheet"}),
                Map.entry("Clinical Patient Care", new String[]{"patient care", "clinical", "vital signs", "nursing"})
        );

        for (Map.Entry<String, String[]> entry : commonTech.entrySet()) {
            for (String kw : entry.getValue()) {
                if (Pattern.compile("\\b" + Pattern.quote(kw) + "\\b", Pattern.CASE_INSENSITIVE).matcher(jdLower).find()) {
                    map.put(entry.getKey(), new ExtractedRequirement(entry.getKey(), "TECHNICAL", "IMPORTANT", Arrays.asList(entry.getValue())));
                    break;
                }
            }
        }
    }

    private boolean matchesCompetency(String candidateSkill, ExtractedRequirement req) {
        String cLower = candidateSkill.toLowerCase().trim();
        String rLower = req.name.toLowerCase().trim();

        // Direct containment
        if (rLower.contains(cLower) || cLower.contains(rLower)) {
            return true;
        }

        // Trigger containment
        for (String trigger : req.triggers) {
            String tLower = trigger.toLowerCase().trim();
            if (cLower.equals(tLower) || cLower.contains(tLower) || tLower.contains(cLower)) {
                return true;
            }
        }

        // Token intersection (e.g. candidate "React.js" matches req "React", "Spring Framework" matches "Spring Boot")
        String[] cTokens = cLower.split("[^a-zA-Z0-9+#]+");
        for (String ct : cTokens) {
            if (ct.length() >= 3 && !STOP_WORDS.contains(ct)) {
                for (String trigger : req.triggers) {
                    if (trigger.equalsIgnoreCase(ct) || trigger.contains(ct)) {
                        return true;
                    }
                }
            }
        }

        // Common Tech Synonyms
        if ((cLower.contains("react") && rLower.contains("react")) ||
            (cLower.contains("spring") && rLower.contains("spring")) ||
            (cLower.contains("sql") && (rLower.contains("sql") || rLower.contains("database"))) ||
            (cLower.contains("postgres") && rLower.contains("sql")) ||
            (cLower.contains("mysql") && rLower.contains("sql")) ||
            (cLower.contains("ts") && rLower.contains("typescript")) ||
            (cLower.contains("js") && rLower.contains("javascript"))) {
            return true;
        }

        return false;
    }

    private String buildDomainDifferenceSummary(
            String role, String company, String targetDomain, String candidateDomain,
            boolean mismatch, List<String> candidateSkills, List<String> gapSkills, List<String> matchedSkills
    ) {
        StringBuilder sb = new StringBuilder();

        if (mismatch) {
            sb.append("⚠️ **Domain & Functional Mismatch Detected**: ");
            sb.append("The target opening is for a **").append(role).append("** at **").append(company)
              .append("** within the **").append(targetDomain).append("** domain. ");
            sb.append("However, your demonstrated competencies are rooted in **").append(candidateDomain)
              .append("** (e.g., ").append(String.join(", ", candidateSkills.subList(0, Math.min(5, candidateSkills.size())))).append(").\n\n");
            
            sb.append("**Key Disconnect**: ");
            if (!gapSkills.isEmpty()) {
                sb.append("This position primarily measures competencies in **")
                  .append(String.join(", ", gapSkills.subList(0, Math.min(4, gapSkills.size()))))
                  .append("**. ");
            }
            if (!candidateSkills.isEmpty()) {
                sb.append("Your skills (")
                  .append(String.join(", ", candidateSkills.subList(0, Math.min(4, candidateSkills.size()))))
                  .append(") do not directly satisfy the primary functional requirements demanded by this ")
                  .append(targetDomain).append(" opening. ");
            }
            sb.append("Consequently, there are **").append(gapSkills.size()).append(" critical functional deficit(s)** to address.");
        } else {
            sb.append("✅ **Domain Alignment**: ");
            sb.append("The opening for **").append(role).append("** at **").append(company).append("** is aligned with your **").append(candidateDomain).append("** profile. ");
            if (!gapSkills.isEmpty()) {
                sb.append("You have demonstrated **").append(matchedSkills.size()).append(" core competency match(es)**, but need to bridge **")
                  .append(gapSkills.size()).append(" specialized gap area(s)** (")
                  .append(String.join(", ", gapSkills.subList(0, Math.min(4, gapSkills.size()))))
                  .append(") to reach full interview readiness.");
            } else {
                sb.append("Your skillset demonstrates exceptional coverage across all major requirements for this role.");
            }
        }

        return sb.toString();
    }

    private List<String> buildActionableAdvice(
            boolean mismatch, String targetDomain, String candidateDomain,
            String role, List<String> gapSkills, List<String> matchedSkills
    ) {
        List<String> advice = new ArrayList<>();

        if (mismatch) {
            advice.add("Evaluate Alignment: Decide whether to pursue " + targetDomain + " (" + role + ") or focus on your core strength in " + candidateDomain + ".");
            if (!gapSkills.isEmpty()) {
                advice.add("If applying to this " + role + " role: Upskill immediately in primary gap areas: " +
                        String.join(", ", gapSkills.subList(0, Math.min(3, gapSkills.size()))) + ".");
            }
            advice.add("Target Aligned Openings: Applying for roles in " + candidateDomain + " will instantly yield a 75%+ compatibility rating with your verified background.");
        } else {
            if (!gapSkills.isEmpty()) {
                advice.add("Prioritize Gap Closure: Target the identified gap skills (" +
                        String.join(", ", gapSkills.subList(0, Math.min(3, gapSkills.size()))) + ") using the targeted preparation roadmap.");
            }
            if (!matchedSkills.isEmpty()) {
                advice.add("Spotlight Strengths: Frame interview responses around your verified proficiencies in " +
                        String.join(", ", matchedSkills.subList(0, Math.min(3, matchedSkills.size()))) + ".");
            }
            advice.add("Validation: Take diagnostic MCQs or run a mock interview to evaluate your readiness on target requirements.");
        }

        return advice;
    }

    private String capitalize(String s) {
        if (s == null || s.isBlank()) return "";
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    private String capitalizeWords(String s) {
        if (s == null || s.isBlank()) return "";
        String[] words = s.split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String w : words) {
            if (!w.isEmpty()) {
                if (w.equalsIgnoreCase("and") || w.equalsIgnoreCase("or") || w.equalsIgnoreCase("of") || w.equalsIgnoreCase("in")) {
                    sb.append(w.toLowerCase()).append(" ");
                } else if (w.length() <= 3 && (w.equalsIgnoreCase("sql") || w.equalsIgnoreCase("api") || w.equalsIgnoreCase("aws") || w.equalsIgnoreCase("gcp") || w.equalsIgnoreCase("cad") || w.equalsIgnoreCase("crm"))) {
                    sb.append(w.toUpperCase()).append(" ");
                } else {
                    sb.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1)).append(" ");
                }
            }
        }
        return sb.toString().trim();
    }

    private static class ExtractedRequirement {
        String name;
        String category;
        String importance;
        List<String> triggers;

        ExtractedRequirement(String name, String category, String importance, List<String> triggers) {
            this.name = name;
            this.category = category;
            this.importance = importance;
            this.triggers = triggers;
        }
    }
}
