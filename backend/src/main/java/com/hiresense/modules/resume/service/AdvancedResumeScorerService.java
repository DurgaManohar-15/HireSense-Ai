package com.hiresense.modules.resume.service;

import com.hiresense.modules.resume.dto.*;
import com.hiresense.modules.resume.dto.CategorizedKeywordsDto.KeywordItemDto;
import com.hiresense.modules.resume.dto.SkillEvidenceDetailDto.LearningResourceDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

@Slf4j
@Service
public class AdvancedResumeScorerService {

    // Standard Recognized Skill Taxonomy
    public static final Map<String, List<String>> SKILL_TAXONOMY = new LinkedHashMap<>();

    static {
        SKILL_TAXONOMY.put("PROGRAMMING_LANGUAGES", List.of(
                "Java", "Python", "C++", "C#", "JavaScript", "TypeScript", "Go", "Rust", "Kotlin", "Swift", "PHP", "Ruby", "C", "R"
        ));
        SKILL_TAXONOMY.put("FRAMEWORKS", List.of(
                "Spring Boot", "Spring", "React", "Angular", "Vue", "Node.js", "Express", "Django", "FastAPI",
                "Flask", "Next.js", "Hibernate", "ASP.NET", "Tailwind CSS", "Bootstrap", "Redux"
        ));
        SKILL_TAXONOMY.put("DATABASES", List.of(
                "SQL", "MySQL", "PostgreSQL", "MongoDB", "Oracle", "Redis", "SQLite", "Cassandra", "DynamoDB", "Elasticsearch"
        ));
        SKILL_TAXONOMY.put("CLOUD_DEVOPS", List.of(
                "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Jenkins", "Terraform", "Linux", "Git", "GitHub", "GitLab"
        ));
        SKILL_TAXONOMY.put("TOOLS_METHODOLOGIES", List.of(
                "REST API", "GraphQL", "Microservices", "OOP", "Data Structures", "Algorithms", "DBMS", "Operating Systems",
                "JUnit", "Postman", "Maven", "Gradle", "Agile", "Scrum", "Jira"
        ));
        SKILL_TAXONOMY.put("SOFT_SKILLS", List.of(
                "Problem Solving", "Communication", "Teamwork", "Leadership", "Analytical Thinking", "Time Management", "Adaptability"
        ));
    }

    public static final Map<String, List<String>> SECTION_INDICATORS = Map.of(
            "Contact Information", List.of("phone", "email", "@", "linkedin.com", "github.com", "contact", "mobile"),
            "Professional Summary", List.of("summary", "objective", "profile", "about me", "professional summary"),
            "Education", List.of("education", "b.tech", "b.e.", "bachelor", "degree", "university", "college", "cgpa", "gpa"),
            "Skills", List.of("skills", "technical skills", "technologies", "core competencies", "programming languages"),
            "Projects", List.of("projects", "academic projects", "key projects", "capstone", "portfolio"),
            "Experience", List.of("experience", "work experience", "internship", "employment", "professional experience"),
            "Certifications", List.of("certifications", "certificates", "licenses", "courses completed", "credentials"),
            "Achievements", List.of("achievements", "honors", "awards", "hackathon", "extracurricular", "publications")
    );

    // Verified Curated Learning Resources Map
    private static final Map<String, List<LearningResourceDto>> VERIFIED_RESOURCES = Map.of(
            "aws", List.of(
                    LearningResourceDto.builder().title("AWS Official Cloud Practitioner Guide").resourceType("OFFICIAL_DOCS").url("https://aws.amazon.com/certification/certified-cloud-practitioner/").estimatedTime("6 hours").verified(true).build(),
                    LearningResourceDto.builder().title("AWS Hands-On Core Services Lab").resourceType("PRACTICE").url("https://aws.amazon.com/getting-started/hands-on/").estimatedTime("4 hours").verified(true).build()
            ),
            "docker", List.of(
                    LearningResourceDto.builder().title("Docker Official Getting Started Guide").resourceType("OFFICIAL_DOCS").url("https://docs.docker.com/get-started/").estimatedTime("3 hours").verified(true).build(),
                    LearningResourceDto.builder().title("Interactive Docker Containerization Lab").resourceType("PRACTICE").url("https://www.docker.com/101-tutorial/").estimatedTime("2 hours").verified(true).build()
            ),
            "kubernetes", List.of(
                    LearningResourceDto.builder().title("Kubernetes Official Interactive Basics").resourceType("OFFICIAL_DOCS").url("https://kubernetes.io/docs/tutorials/kubernetes-basics/").estimatedTime("5 hours").verified(true).build()
            ),
            "spring boot", List.of(
                    LearningResourceDto.builder().title("Spring Boot Official Building a RESTful Web Service").resourceType("OFFICIAL_DOCS").url("https://spring.io/guides/gs/rest-service/").estimatedTime("2 hours").verified(true).build(),
                    LearningResourceDto.builder().title("HireSense Backend Masterclass: Enterprise Spring Boot").resourceType("HIRESENSE_MODULE").url("/assessments?category=TECHNICAL").estimatedTime("3 hours").verified(true).build()
            ),
            "java", List.of(
                    LearningResourceDto.builder().title("Oracle Java Official Documentation & Tutorials").resourceType("OFFICIAL_DOCS").url("https://docs.oracle.com/javase/tutorial/").estimatedTime("4 hours").verified(true).build(),
                    LearningResourceDto.builder().title("HireSense Java Core & OOP Interactive Quiz").resourceType("HIRESENSE_MODULE").url("/assessments?topic=Java").estimatedTime("1 hour").verified(true).build()
            ),
            "sql", List.of(
                    LearningResourceDto.builder().title("PostgreSQL Official Tutorial & Query Optimization").resourceType("OFFICIAL_DOCS").url("https://www.postgresql.org/docs/current/tutorial.html").estimatedTime("3 hours").verified(true).build(),
                    LearningResourceDto.builder().title("HireSense Database Design & SQL Assessment").resourceType("HIRESENSE_MODULE").url("/assessments?topic=SQL").estimatedTime("45 mins").verified(true).build()
            ),
            "microservices", List.of(
                    LearningResourceDto.builder().title("Microservices Architecture Patterns by Martin Fowler").resourceType("TUTORIAL").url("https://martinfowler.com/articles/microservices.html").estimatedTime("2 hours").verified(true).build()
            )
    );

    /**
     * Computes the complete deterministic evaluation of a resume.
     */
    public ResumeAnalysisResultDto computeDeterministicAnalysis(
            String resumeText,
            String targetRole,
            String targetCompany,
            String jobDescription,
            List<String> userAssessmentTopics,
            Map<String, Integer> userAssessmentScores,
            Map<String, Integer> userInterviewScores
    ) {
        String lowerText = resumeText.toLowerCase();
        boolean hasJd = jobDescription != null && !jobDescription.trim().isEmpty();

        // 1. Structure Audit & Section Extraction
        List<String> sectionsFound = new ArrayList<>();
        List<String> missingSections = new ArrayList<>();
        List<ResumeSectionReviewDto> sectionReviews = new ArrayList<>();

        for (Map.Entry<String, List<String>> entry : SECTION_INDICATORS.entrySet()) {
            String sectionName = entry.getKey();
            boolean present = entry.getValue().stream().anyMatch(lowerText::contains);
            if (present) {
                sectionsFound.add(sectionName);
            } else {
                missingSections.add(sectionName);
            }

            // Build detailed section review
            ResumeSectionReviewDto review = buildSectionReview(sectionName, present, lowerText, resumeText);
            sectionReviews.add(review);
        }

        // 2. Keyword Extraction & Categorization
        CategorizedKeywordsDto categorizedKeywords = extractCategorizedKeywords(resumeText, jobDescription);
        List<String> allExtractedSkills = collectAllExtractedSkillNames(categorizedKeywords);

        // 3. ATS Audit Points
        List<String> atsAuditDetails = computeAtsAuditDetails(lowerText, sectionsFound, missingSections, resumeText);
        int atsScore = calculateDeterministicAtsScore(sectionsFound, missingSections, resumeText);

        // 4. Deterministic 6-Category Resume Quality Score
        AdvancedResumeScoreBreakdownDto breakdown = calculateScoreBreakdown(
                resumeText, sectionsFound, allExtractedSkills, categorizedKeywords, atsScore, hasJd, jobDescription
        );
        int overallResumeScore = breakdown.getOverallScore();

        // 5. JD Matching & Multi-source Evidence Calculation
        List<String> jdRequiredSkills = new ArrayList<>();
        List<String> jdMatchingSkills = new ArrayList<>();
        List<String> jdMissingSkills = new ArrayList<>();
        List<SkillEvidenceDetailDto> skillEvidenceDetails = new ArrayList<>();
        Integer jdMatchScore = null;

        if (hasJd) {
            String lowerJd = jobDescription.toLowerCase();
            Set<String> jdSkillsFound = extractSkillsFromText(lowerJd);

            for (String skill : jdSkillsFound) {
                jdRequiredSkills.add(skill);
                boolean inResume = allExtractedSkills.stream().anyMatch(s -> s.equalsIgnoreCase(skill));
                if (inResume) {
                    jdMatchingSkills.add(skill);
                } else {
                    jdMissingSkills.add(skill);
                }

                // Compute Multi-source evidence for this skill
                SkillEvidenceDetailDto evidenceDetail = calibrateSkillEvidence(
                        skill, inResume, resumeText, userAssessmentScores, userInterviewScores, true, "REQUIRED"
                );
                skillEvidenceDetails.add(evidenceDetail);
            }

            // Compute deterministic JD match score
            if (!jdRequiredSkills.isEmpty()) {
                double matchFraction = (double) jdMatchingSkills.size() / jdRequiredSkills.size();
                // Weighted average of resume presence (70%) and multi-source evidence (30%)
                double avgEvidenceScore = skillEvidenceDetails.stream()
                        .mapToInt(SkillEvidenceDetailDto::getCurrentObservedLevel)
                        .average().orElse(50.0);
                jdMatchScore = (int) Math.round((matchFraction * 70.0) + (avgEvidenceScore * 0.30));
                jdMatchScore = Math.min(100, Math.max(10, jdMatchScore));
            } else {
                jdMatchScore = 75;
            }
        } else {
            // Standalone mode: Evaluate top extracted skills against general industry standard
            for (String skill : allExtractedSkills) {
                SkillEvidenceDetailDto evidenceDetail = calibrateSkillEvidence(
                        skill, true, resumeText, userAssessmentScores, userInterviewScores, false, "OPTIONAL"
                );
                skillEvidenceDetails.add(evidenceDetail);
            }
        }

        // Sort skill evidence: Gaps first, then highest proficiency
        skillEvidenceDetails.sort(Comparator.comparing(SkillEvidenceDetailDto::getGapScore).reversed()
                .thenComparing(SkillEvidenceDetailDto::getCurrentObservedLevel, Comparator.reverseOrder()));

        // 6. Strengths, Weaknesses, Contextual Questions, and Recommendations
        List<String> strengths = generateStrengths(breakdown, sectionsFound, allExtractedSkills);
        List<String> weaknesses = generateWeaknesses(breakdown, missingSections, jdMissingSkills);
        List<String> contextualQuestions = generateContextualQuestions(jdMissingSkills, resumeText);
        List<String> tailoredSuggestions = generateTailoredSuggestions(jdMissingSkills, missingSections, targetRole);
        List<String> learningPriorities = generateLearningPriorities(skillEvidenceDetails);

        return ResumeAnalysisResultDto.builder()
                .overallScore(overallResumeScore)
                .atsOrientedScore(atsScore)
                .targetRoleMatchSummary(hasJd
                        ? String.format("Analyzed against %s role requirements. Found %d matching skills and %d priority skill gaps.",
                        targetRole, jdMatchingSkills.size(), jdMissingSkills.size())
                        : String.format("Evaluated for %s role readiness with deterministic multi-rubric calibration.", targetRole))
                .scoreBreakdown(breakdown)
                .categorizedKeywords(categorizedKeywords)
                .sectionReviews(sectionReviews)
                .skillEvidenceDetails(skillEvidenceDetails)
                .sectionsFound(sectionsFound)
                .missingSections(missingSections)
                .strengths(strengths)
                .weaknesses(weaknesses)
                .extractedSkills(allExtractedSkills)
                .keywords(allExtractedSkills)
                .recommendations(tailoredSuggestions)
                .atsAuditDetails(atsAuditDetails)
                .contextualQuestions(contextualQuestions)
                .mode(hasJd ? "JOB_DESCRIPTION" : "STANDALONE")
                .jobTitle(targetRole)
                .company(targetCompany)
                .jdMatchScore(jdMatchScore)
                .jdRequiredSkills(jdRequiredSkills)
                .jdMatchingSkills(jdMatchingSkills)
                .jdMissingSkills(jdMissingSkills)
                .tailoredSuggestions(tailoredSuggestions)
                .learningPriorities(learningPriorities)
                .build();
    }

    // =========================================================================
    // Deterministic Scoring Engine (6 Components)
    // =========================================================================
    private AdvancedResumeScoreBreakdownDto calculateScoreBreakdown(
            String resumeText,
            List<String> sectionsFound,
            List<String> extractedSkills,
            CategorizedKeywordsDto categorizedKeywords,
            int atsScore,
            boolean hasJd,
            String jobDescription
    ) {
        String lower = resumeText.toLowerCase();

        // 1. Content Quality (20%): Action verbs, metric usage (%, $, X to Y), length & clarity
        int contentScore = 50;
        if (containsMetrics(lower)) contentScore += 25;
        if (containsStrongActionVerbs(lower)) contentScore += 15;
        if (resumeText.length() >= 800 && resumeText.length() <= 4500) contentScore += 10;
        contentScore = Math.min(100, Math.max(20, contentScore));

        ScoreCategoryDetailDto contentQuality = ScoreCategoryDetailDto.builder()
                .categoryName("Content Quality")
                .score(contentScore)
                .weight(0.20)
                .weightedScore((int) Math.round(contentScore * 0.20))
                .whatIsGood(containsMetrics(lower) ? List.of("Includes quantifiable metrics and achievements.", "Clear and professional phrasing.") : List.of("Clear technical statements present."))
                .whatNeedsImprovement(!containsMetrics(lower) ? List.of("Lack of quantifiable outcomes (e.g., 'improved performance by 25%').") : List.of("Add more impact-driven bullet points in project descriptions."))
                .recommendedActions(List.of("Use the XYZ formula: 'Accomplished [X] as measured by [Y] by doing [Z]'."))
                .build();

        // 2. Skills Relevance (20%): Skill diversity across languages, frameworks, DB, Cloud
        int skillCategoriesCount = 0;
        if (!categorizedKeywords.getProgrammingLanguages().isEmpty()) skillCategoriesCount++;
        if (!categorizedKeywords.getFrameworksAndLibraries().isEmpty()) skillCategoriesCount++;
        if (!categorizedKeywords.getDatabases().isEmpty()) skillCategoriesCount++;
        if (!categorizedKeywords.getCloudAndDevOps().isEmpty()) skillCategoriesCount++;
        if (!categorizedKeywords.getToolsAndMethodologies().isEmpty()) skillCategoriesCount++;

        int skillsScore = Math.min(100, Math.max(25, 30 + (skillCategoriesCount * 12) + Math.min(20, extractedSkills.size() * 2)));

        ScoreCategoryDetailDto skillsRelevance = ScoreCategoryDetailDto.builder()
                .categoryName("Skills Relevance")
                .score(skillsScore)
                .weight(0.20)
                .weightedScore((int) Math.round(skillsScore * 0.20))
                .whatIsGood(List.of(String.format("Found %d verified technical skills across %d categories.", extractedSkills.size(), skillCategoriesCount)))
                .whatNeedsImprovement(skillCategoriesCount < 4 ? List.of("Sparse coverage in Cloud/DevOps or Modern Database technologies.") : List.of("Ensure proficiency depth is demonstrated in projects."))
                .recommendedActions(List.of("Categorize your skills clearly under Languages, Frameworks, Databases, and Tools."))
                .build();

        // 3. Experience & Project Evidence (20%): Projects and experience section richness
        int expScore = 40;
        if (sectionsFound.contains("Projects")) expScore += 25;
        if (sectionsFound.contains("Experience")) expScore += 25;
        if (lower.contains("github.com") || lower.contains("deployed") || lower.contains("live demo")) expScore += 10;
        expScore = Math.min(100, Math.max(20, expScore));

        ScoreCategoryDetailDto experienceAndProjects = ScoreCategoryDetailDto.builder()
                .categoryName("Experience & Projects Evidence")
                .score(expScore)
                .weight(0.20)
                .weightedScore((int) Math.round(expScore * 0.20))
                .whatIsGood(sectionsFound.contains("Projects") ? List.of("Dedicated technical project section detected with clear tech stacks.") : List.of("Core experience details present."))
                .whatNeedsImprovement(!sectionsFound.contains("Experience") ? List.of("No formal internship/experience section found (strengthen capstone projects).") : List.of("Highlight architecture and deployment details for your projects."))
                .recommendedActions(List.of("Add clickable GitHub repository or live deployment links for top projects."))
                .build();

        // 4. Keyword Relevance (15%): Density and JD alignment
        int keywordScore = Math.min(95, Math.max(30, 40 + (extractedSkills.size() * 3)));
        if (hasJd && jobDescription != null) {
            Set<String> jdSkills = extractSkillsFromText(jobDescription.toLowerCase());
            if (!jdSkills.isEmpty()) {
                long matching = jdSkills.stream().filter(s -> extractedSkills.stream().anyMatch(e -> e.equalsIgnoreCase(s))).count();
                keywordScore = (int) Math.round(((double) matching / jdSkills.size()) * 100);
            }
        }
        keywordScore = Math.min(100, Math.max(25, keywordScore));

        ScoreCategoryDetailDto keywordRelevance = ScoreCategoryDetailDto.builder()
                .categoryName("Keyword Relevance")
                .score(keywordScore)
                .weight(0.15)
                .weightedScore((int) Math.round(keywordScore * 0.15))
                .whatIsGood(List.of(String.format("Identified %d relevant industry keywords.", extractedSkills.size())))
                .whatNeedsImprovement(List.of("Integrate modern keywords contextually within project bullet points."))
                .recommendedActions(List.of("Align skill terms precisely with target role job descriptions."))
                .build();

        // 5. Structure & Readability (15%): Standard headings, contact completeness
        int structureScore = Math.min(100, Math.max(25, (sectionsFound.size() * 12) + (resumeText.length() > 500 ? 10 : 0)));

        ScoreCategoryDetailDto structureAndReadability = ScoreCategoryDetailDto.builder()
                .categoryName("Structure & Readability")
                .score(structureScore)
                .weight(0.15)
                .weightedScore((int) Math.round(structureScore * 0.15))
                .whatIsGood(List.of(String.format("%d of %d standard resume sections detected.", sectionsFound.size(), SECTION_INDICATORS.size())))
                .whatNeedsImprovement(sectionsFound.size() < 6 ? List.of("Missing standard sections like Certifications, Achievements, or Summary.") : List.of("Maintain uniform bullet spacing and font hierarchy."))
                .recommendedActions(List.of("Ensure clear section headers without complex nested columns."))
                .build();

        // 6. ATS Compatibility (10%): Text extractability, contact info, no tables/graphics
        ScoreCategoryDetailDto atsCompatibility = ScoreCategoryDetailDto.builder()
                .categoryName("ATS Compatibility")
                .score(atsScore)
                .weight(0.10)
                .weightedScore((int) Math.round(atsScore * 0.10))
                .whatIsGood(List.of("Text stream parsed cleanly without character corruption.", "Standard section headings are machine-readable."))
                .whatNeedsImprovement(atsScore < 80 ? List.of("Avoid multi-column tables or header icons that can confuse ATS parsers.") : List.of("Ensure email and phone number are in standard plain-text format."))
                .recommendedActions(List.of("Keep a single-column, standard PDF layout for highest ATS compatibility."))
                .build();

        // Impact & Metrics Rubric
        ScoreCategoryDetailDto impactAndMetrics = ScoreCategoryDetailDto.builder()
                .categoryName("Impact & Metrics")
                .score(containsMetrics(lower) ? 82 : 54)
                .weight(0.0)
                .weightedScore(0)
                .whatIsGood(containsMetrics(lower) ? List.of("Quantified achievements detected.") : List.of("Technical descriptions present."))
                .whatNeedsImprovement(!containsMetrics(lower) ? List.of("Bullet points describe tasks rather than measurable outcomes.") : List.of("Add percentage improvements for backend latency or efficiency."))
                .recommendedActions(List.of("Quantify project scope (e.g., 'Handled 5,000 requests/sec with 99.9% uptime')."))
                .build();

        // Overall Score Calculation (Deterministic Weighted Sum)
        int overallScore = (int) Math.round(
                (contentScore * 0.20) +
                (skillsScore * 0.20) +
                (expScore * 0.20) +
                (keywordScore * 0.15) +
                (structureScore * 0.15) +
                (atsScore * 0.10)
        );
        overallScore = Math.min(100, Math.max(20, overallScore));

        return AdvancedResumeScoreBreakdownDto.builder()
                .overallScore(overallScore)
                .atsCompatibilityScore(atsScore)
                .contentQuality(contentQuality)
                .skillsRelevance(skillsRelevance)
                .experienceAndProjects(experienceAndProjects)
                .keywordRelevance(keywordRelevance)
                .structureAndReadability(structureAndReadability)
                .atsCompatibility(atsCompatibility)
                .impactAndMetrics(impactAndMetrics)
                .keyStrengths(List.of(
                        String.format("Strong representation of %d technical skills across core stacks.", extractedSkills.size()),
                        "Clear education and project details formatted cleanly.",
                        "ATS-friendly header and standard structure."
                ))
                .keyGaps(List.of(
                        "Project bullet points can be strengthened with more quantified business impact.",
                        "Cloud deployment and automated testing keywords can be highlighted more prominently."
                ))
                .immediateActionPlan(List.of(
                        "Review AI-suggested improvements for your Professional Summary and Project descriptions.",
                        "Answer contextual clarifying questions to truthfully incorporate missing tools.",
                        "Verify your skill evidence by completing short practice quizzes in HireSense."
                ))
                .build();
    }

    private int calculateDeterministicAtsScore(List<String> sectionsFound, List<String> missingSections, String resumeText) {
        int score = 40;
        score += Math.min(35, sectionsFound.size() * 5);
        if (resumeText.contains("@") && (resumeText.contains(".com") || resumeText.contains(".in") || resumeText.contains(".edu"))) score += 10;
        if (resumeText.toLowerCase().contains("linkedin.com") || resumeText.toLowerCase().contains("github.com")) score += 10;
        if (resumeText.length() >= 600 && resumeText.length() <= 6000) score += 5;
        return Math.min(95, Math.max(30, score));
    }

    private List<String> computeAtsAuditDetails(String lowerText, List<String> sectionsFound, List<String> missingSections, String resumeText) {
        List<String> audit = new ArrayList<>();
        audit.add(String.format("✓ Machine Readability: Successfully extracted %d characters of clean text stream.", resumeText.length()));
        if (lowerText.contains("@")) {
            audit.add("✓ Contact Header: Email address detected in plain-text format.");
        } else {
            audit.add("⚠ Contact Header: Email address missing or in non-standard format.");
        }
        if (lowerText.contains("linkedin.com") || lowerText.contains("github.com")) {
            audit.add("✓ Professional Profiles: LinkedIn / GitHub links detected.");
        }
        if (sectionsFound.contains("Education") && sectionsFound.contains("Skills") && sectionsFound.contains("Projects")) {
            audit.add("✓ Standard Headings: Core sections (Education, Skills, Projects) follow ATS-standard naming conventions.");
        }
        if (!missingSections.isEmpty()) {
            audit.add(String.format("ℹ Section Coverage: Sections not explicitly recognized: %s.", String.join(", ", missingSections)));
        }
        audit.add("ℹ Note: ATS compatibility analysis evaluates parsing readability and section standards; actual ATS screening depends on company-specific scoring filters.");
        return audit;
    }

    private ResumeSectionReviewDto buildSectionReview(String sectionName, boolean present, String lowerText, String rawText) {
        String status = present ? "GOOD" : "MISSING";
        int score = present ? 85 : 0;
        List<String> positives = new ArrayList<>();
        List<String> issues = new ArrayList<>();
        String suggestion = "";
        String question = null;

        switch (sectionName) {
            case "Professional Summary" -> {
                if (present) {
                    positives.add("Present and positioned at the top of the resume.");
                    if (lowerText.contains("passionate") || lowerText.contains("hardworking") || lowerText.contains("enthusiastic")) {
                        issues.add("Contains generic buzzwords ('passionate', 'hardworking') rather than concrete engineering highlights.");
                        score = 65;
                        status = "NEEDS_IMPROVEMENT";
                    }
                    suggestion = "Craft a 2-3 line summary emphasizing target engineering domains, core languages (e.g. Java, Python), and quantifiable project scope.";
                } else {
                    issues.add("Professional summary is missing. A concise summary helps recruiters immediately understand your focus.");
                    suggestion = "Add a 2-3 sentence summary: 'Aspiring Software Engineer with expertise in Java, Spring Boot, and SQL. Built scalable full-stack applications with focus on REST APIs and clean architecture.'";
                }
            }
            case "Projects" -> {
                if (present) {
                    positives.add("Projects section is present with technical titles.");
                    if (!containsMetrics(lowerText)) {
                        issues.add("Project descriptions focus on task actions rather than measurable results (e.g., latency, users, performance).");
                        score = 75;
                        status = "NEEDS_IMPROVEMENT";
                    }
                    suggestion = "Format each project bullet using: Action Verb + Tech Stack Used + Measurable Result (e.g., 'Engineered REST APIs using Spring Boot, reducing data fetch latency by 35%').";
                } else {
                    issues.add("No dedicated technical projects section found. Essential for engineering candidates.");
                    suggestion = "Add 2-3 significant technical projects specifying role, architecture, tools, and GitHub links.";
                }
            }
            case "Skills" -> {
                if (present) {
                    positives.add("Extracted multiple technical keywords categorized under standard domains.");
                    suggestion = "Group skills logically: Languages, Frameworks, Databases, Cloud & DevOps, and Tools.";
                } else {
                    issues.add("Technical skills are not listed in a dedicated section.");
                    suggestion = "Create a clear 'Technical Skills' section near the top of the resume.";
                }
            }
            case "Education" -> {
                if (present) {
                    positives.add("Degree, institution, and graduation timeline detected.");
                } else {
                    issues.add("Education details are not prominently visible.");
                    suggestion = "List your Degree, University, CGPA/Percentage, and Expected Graduation Year.";
                }
            }
            case "Experience" -> {
                if (present) {
                    positives.add("Work experience or internship section detected.");
                } else {
                    issues.add("No formal internship or employment section found.");
                    suggestion = "If you completed internships, list company, title, and key contributions. Otherwise, expand your capstone projects.";
                    question = "Have you completed any technical internships, freelance projects, or research fellowships?";
                }
            }
            case "Certifications" -> {
                if (present) {
                    positives.add("Verified certifications or external credentials detected.");
                } else {
                    issues.add("No certifications listed.");
                    suggestion = "Add verified certifications from AWS, Oracle, Google Cloud, or Coursera to validate skill depth.";
                    question = "Do you hold any professional cloud, database, or programming certifications?";
                }
            }
            default -> {
                if (present) positives.add("Section present.");
                else issues.add("Section omitted.");
            }
        }

        return ResumeSectionReviewDto.builder()
                .sectionName(sectionName)
                .status(status)
                .sectionScore(score)
                .positiveObservations(positives)
                .issuesFound(issues)
                .suggestedImprovement(suggestion)
                .contextualClarifyingQuestion(question)
                .suggestionStatus("PENDING")
                .build();
    }

    // =========================================================================
    // Categorized Keywords Extraction
    // =========================================================================
    private CategorizedKeywordsDto extractCategorizedKeywords(String resumeText, String jobDescription) {
        String lowerResume = resumeText.toLowerCase();
        String lowerJd = jobDescription != null ? jobDescription.toLowerCase() : "";

        CategorizedKeywordsDto dto = new CategorizedKeywordsDto();

        for (Map.Entry<String, List<String>> entry : SKILL_TAXONOMY.entrySet()) {
            String category = entry.getKey();
            List<KeywordItemDto> items = new ArrayList<>();

            for (String skill : entry.getValue()) {
                String skillLower = skill.toLowerCase();
                Pattern p = Pattern.compile("\\b" + Pattern.quote(skillLower) + "\\b", Pattern.CASE_INSENSITIVE);
                var matcher = p.matcher(resumeText);
                int count = 0;
                while (matcher.find()) {
                    count++;
                }

                boolean requiredByJd = !lowerJd.isEmpty() && lowerJd.contains(skillLower);

                String representation;
                if (count >= 3) {
                    representation = "STRONGLY_REPRESENTED";
                } else if (count == 2) {
                    representation = "STRONGLY_REPRESENTED";
                } else if (count == 1) {
                    representation = "MENTIONED_ONCE";
                } else {
                    representation = requiredByJd ? "MISSING_FROM_RESUME" : null;
                }

                if (representation != null) {
                    items.add(KeywordItemDto.builder()
                            .keyword(skill)
                            .representation(representation)
                            .occurrenceCount(count)
                            .requiredByJd(requiredByJd)
                            .build());
                }
            }

            switch (category) {
                case "PROGRAMMING_LANGUAGES" -> dto.setProgrammingLanguages(items);
                case "FRAMEWORKS" -> dto.setFrameworksAndLibraries(items);
                case "DATABASES" -> dto.setDatabases(items);
                case "CLOUD_DEVOPS" -> dto.setCloudAndDevOps(items);
                case "TOOLS_METHODOLOGIES" -> dto.setToolsAndMethodologies(items);
                case "SOFT_SKILLS" -> dto.setSoftSkillsAndDomain(items);
            }
        }

        return dto;
    }

    private List<String> collectAllExtractedSkillNames(CategorizedKeywordsDto categorizedKeywords) {
        Set<String> skills = new LinkedHashSet<>();
        if (categorizedKeywords == null) return new ArrayList<>();

        addPresentKeywords(categorizedKeywords.getProgrammingLanguages(), skills);
        addPresentKeywords(categorizedKeywords.getFrameworksAndLibraries(), skills);
        addPresentKeywords(categorizedKeywords.getDatabases(), skills);
        addPresentKeywords(categorizedKeywords.getCloudAndDevOps(), skills);
        addPresentKeywords(categorizedKeywords.getToolsAndMethodologies(), skills);
        addPresentKeywords(categorizedKeywords.getSoftSkillsAndDomain(), skills);

        return new ArrayList<>(skills);
    }

    private void addPresentKeywords(List<KeywordItemDto> list, Set<String> target) {
        if (list != null) {
            for (KeywordItemDto k : list) {
                if (!"MISSING_FROM_RESUME".equalsIgnoreCase(k.getRepresentation())) {
                    target.add(k.getKeyword());
                }
            }
        }
    }

    private Set<String> extractSkillsFromText(String text) {
        Set<String> found = new LinkedHashSet<>();
        for (List<String> skillList : SKILL_TAXONOMY.values()) {
            for (String skill : skillList) {
                Pattern p = Pattern.compile("\\b" + Pattern.quote(skill.toLowerCase()) + "\\b", Pattern.CASE_INSENSITIVE);
                if (p.matcher(text).find()) {
                    found.add(skill);
                }
            }
        }
        return found;
    }

    // =========================================================================
    // Multi-source Evidence Calibrator
    // =========================================================================
    public SkillEvidenceDetailDto calibrateSkillEvidence(
            String skillName,
            boolean inResume,
            String resumeText,
            Map<String, Integer> userAssessmentScores,
            Map<String, Integer> userInterviewScores,
            boolean requiredByJd,
            String requirementImportance
    ) {
        String key = skillName.toLowerCase().trim();
        List<String> evidenceParts = new ArrayList<>();

        // 1. Resume Evidence
        int resumeProf = 0;
        String resumeDetails = "Not mentioned in resume text";
        if (inResume) {
            resumeProf = 75;
            Pattern p = Pattern.compile("\\b" + Pattern.quote(key) + "\\b", Pattern.CASE_INSENSITIVE);
            var m = p.matcher(resumeText != null ? resumeText : "");
            int count = 0;
            while (m.find()) count++;
            if (count > 2) {
                resumeProf = 85;
                resumeDetails = String.format("Strongly represented (%d occurrences across projects/skills)", count);
            } else {
                resumeDetails = String.format("Present in resume (%d occurrence)", count);
            }
            evidenceParts.add("Resume (" + resumeProf + "%)");
        }

        // 2. Assessment Evidence
        boolean assessmentPresent = userAssessmentScores != null && userAssessmentScores.containsKey(key);
        Integer assessmentScore = assessmentPresent ? userAssessmentScores.get(key) : null;
        if (assessmentPresent) {
            evidenceParts.add("Assessment (" + assessmentScore + "%)");
        }

        // 3. Interview Evidence
        boolean interviewPresent = userInterviewScores != null && userInterviewScores.containsKey(key);
        Integer interviewScore = interviewPresent ? userInterviewScores.get(key) : null;
        if (interviewPresent) {
            evidenceParts.add("Interview (" + interviewScore + "%)");
        }

        // 4. Project Evidence
        boolean projectEvidencePresent = inResume && (resumeText != null && resumeText.toLowerCase().contains("project"));
        String projectDetails = projectEvidencePresent ? "Referenced in project implementations" : "No specific project evidence";

        // Multi-source Observed Score Calculation
        int total = 0;
        int sources = 0;
        if (inResume) { total += resumeProf; sources++; }
        if (assessmentPresent) { total += assessmentScore; sources++; }
        if (interviewPresent) { total += interviewScore; sources++; }

        int observedLevel = sources > 0 ? (total / sources) : 0;
        int requiredLevel = requiredByJd ? ("REQUIRED".equalsIgnoreCase(requirementImportance) ? 80 : 70) : 70;
        int gap = Math.max(0, requiredLevel - observedLevel);

        // Match Status Classification
        String matchStatus;
        if (sources == 0) {
            matchStatus = "NOT_DEMONSTRATED";
        } else if (observedLevel >= requiredLevel) {
            matchStatus = "STRONG_MATCH";
        } else if (observedLevel >= 55) {
            matchStatus = "PARTIAL_MATCH";
        } else {
            matchStatus = "WEAK_MATCH";
        }

        String priority;
        if (gap >= 25 || (requiredByJd && gap >= 15)) {
            priority = "HIGH";
        } else if (gap >= 10) {
            priority = "MEDIUM";
        } else {
            priority = "LOW";
        }

        // Distinguish Keyword Gap vs Actual Skill Gap
        boolean isResumeKeywordGap = !inResume;
        boolean isActualSkillGap = observedLevel < requiredLevel;

        String recommendation = gap > 0
                ? String.format("Improve proficiency in %s to bridge the -%d%% gap against target requirement (%d%%).", skillName, gap, requiredLevel)
                : String.format("Demonstrated strong evidence (%d%%) meeting or exceeding target level.", observedLevel);

        List<LearningResourceDto> resources = VERIFIED_RESOURCES.getOrDefault(key, List.of(
                LearningResourceDto.builder()
                        .title("HireSense " + skillName + " Practice & Assessment Module")
                        .resourceType("HIRESENSE_MODULE")
                        .url("/assessments?topic=" + skillName)
                        .estimatedTime("1-2 hours")
                        .verified(true)
                        .build()
        ));

        return SkillEvidenceDetailDto.builder()
                .skillName(skillName)
                .category(determineCategory(skillName))
                .requiredByJd(requiredByJd)
                .requirementImportance(requirementImportance)
                .resumePresent(inResume)
                .resumeEvidenceDetails(resumeDetails)
                .assessmentPresent(assessmentPresent)
                .assessmentScore(assessmentScore)
                .interviewPresent(interviewPresent)
                .interviewScore(interviewScore)
                .projectEvidencePresent(projectEvidencePresent)
                .projectEvidenceDetails(projectDetails)
                .certificationPresent(false)
                .currentObservedLevel(observedLevel)
                .requiredTargetLevel(requiredLevel)
                .gapScore(gap)
                .matchStatus(matchStatus)
                .priority(priority)
                .evidenceSummary(evidenceParts.isEmpty() ? "No verified evidence recorded" : String.join(" • ", evidenceParts))
                .isResumeKeywordGap(isResumeKeywordGap)
                .isActualSkillGap(isActualSkillGap)
                .recommendationText(recommendation)
                .recommendedResources(resources)
                .build();
    }

    private String determineCategory(String skill) {
        for (Map.Entry<String, List<String>> e : SKILL_TAXONOMY.entrySet()) {
            if (e.getValue().stream().anyMatch(s -> s.equalsIgnoreCase(skill))) {
                return e.getKey();
            }
        }
        return "TECHNICAL";
    }

    private boolean containsMetrics(String text) {
        return text.contains("%") || text.matches(".*\\b\\d+\\+?\\s*(users|clients|requests|ms|seconds|minutes|hours|projects|tests|stars|downloads|endpoints|x|percent|times)\\b.*")
                || text.matches(".*\\b(reduced|increased|improved|boosted|optimized|scaled|accelerated)\\b.*");
    }

    private boolean containsStrongActionVerbs(String text) {
        return text.matches(".*\\b(architected|engineered|spearheaded|developed|designed|implemented|deployed|optimized|refactored|automated|built)\\b.*");
    }

    private List<String> generateStrengths(AdvancedResumeScoreBreakdownDto breakdown, List<String> sectionsFound, List<String> extractedSkills) {
        List<String> list = new ArrayList<>();
        list.add(String.format("Verified technical skills footprint: Detected %d core technical competencies.", extractedSkills.size()));
        if (sectionsFound.contains("Projects")) list.add("Dedicated technical projects section highlighting applied software development.");
        if (sectionsFound.contains("Education")) list.add("Clearly structured academic background with institution and degree details.");
        if (breakdown.getAtsCompatibilityScore() >= 75) list.add("High ATS compatibility with machine-parsable standard headings.");
        return list;
    }

    private List<String> generateWeaknesses(AdvancedResumeScoreBreakdownDto breakdown, List<String> missingSections, List<String> jdMissingSkills) {
        List<String> list = new ArrayList<>();
        if (!missingSections.isEmpty()) {
            list.add(String.format("Missing standard sections: %s.", String.join(", ", missingSections)));
        }
        if (!jdMissingSkills.isEmpty()) {
            list.add(String.format("Target job requires skills not explicitly demonstrated: %s.", String.join(", ", jdMissingSkills)));
        }
        if (breakdown.getContentQuality().getScore() < 75) {
            list.add("Project bullet points lack quantifiable impact metrics (e.g. latency, scale, efficiency gains).");
        }
        return list;
    }

    private List<String> generateContextualQuestions(List<String> jdMissingSkills, String resumeText) {
        List<String> questions = new ArrayList<>();
        for (String skill : jdMissingSkills) {
            questions.add(String.format("Have you used %s in any academic, personal, or internship projects? (If yes, describe your experience to add truthful bullet points).", skill));
            if (questions.size() >= 3) break;
        }
        return questions;
    }

    private List<String> generateTailoredSuggestions(List<String> jdMissingSkills, List<String> missingSections, String targetRole) {
        List<String> suggestions = new ArrayList<>();
        if (!jdMissingSkills.isEmpty()) {
            suggestions.add(String.format("If you have hands-on experience with %s, add specific implementation bullet points under your Projects section.", String.join(", ", jdMissingSkills)));
        }
        if (missingSections.contains("Professional Summary")) {
            suggestions.add(String.format("Add a targeted 2-3 line Professional Summary aligned directly with %s responsibilities.", targetRole));
        }
        suggestions.add("Use strong action verbs (Engineered, Architected, Optimized) at the start of each bullet point.");
        return suggestions;
    }

    private List<String> generateLearningPriorities(List<SkillEvidenceDetailDto> details) {
        return details.stream()
                .filter(d -> d.getGapScore() > 0)
                .sorted(Comparator.comparing(SkillEvidenceDetailDto::getGapScore).reversed())
                .limit(4)
                .map(d -> String.format("Priority %s: %s (Gap: -%d%%, Target: %d%%)", d.getPriority(), d.getSkillName(), d.getGapScore(), d.getRequiredTargetLevel()))
                .toList();
    }
}
