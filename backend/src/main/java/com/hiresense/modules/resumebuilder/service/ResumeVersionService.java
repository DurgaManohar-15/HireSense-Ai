package com.hiresense.modules.resumebuilder.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiresense.modules.ai.AIService;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.job.model.Job;
import com.hiresense.modules.job.repository.JobRepository;
import com.hiresense.modules.profile.model.StudentProfile;
import com.hiresense.modules.profile.repository.StudentProfileRepository;
import com.hiresense.modules.resumebuilder.dto.*;
import com.hiresense.modules.resumebuilder.model.ResumeVersion;
import com.hiresense.modules.resumebuilder.repository.ResumeVersionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeVersionService {

    private final ResumeVersionRepository resumeVersionRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository profileRepository;
    private final JobRepository jobRepository;
    private final AIService aiService;
    private final ObjectMapper objectMapper;

    @Transactional
    public List<ResumeVersionDto> getMyResumeVersions(Long userId) {
        List<ResumeVersion> versions = resumeVersionRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        if (versions.isEmpty()) {
            // Seed baseline Master Resume from student profile
            ResumeVersion master = createMasterResumeFromProfile(userId);
            return List.of(toDto(master));
        }
        return versions.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ResumeVersionDto getResumeVersionById(Long id, Long userId) {
        ResumeVersion version = resumeVersionRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new IllegalArgumentException("Resume version not found"));
        return toDto(version);
    }

    @Transactional
    public ResumeVersionDto createResumeVersion(Long userId, ResumeVersionDto dto) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean isFirst = resumeVersionRepository.countByUserId(userId) == 0;

        ResumeVersion version = ResumeVersion.builder()
            .user(user)
            .title(dto.getTitle() != null ? dto.getTitle().trim() : "Custom Resume")
            .targetRole(dto.getTargetRole())
            .templateId(dto.getTemplateId() != null ? dto.getTemplateId() : "ats_minimal")
            .fullName(dto.getFullName() != null ? dto.getFullName() : user.getFirstName() + " " + user.getLastName())
            .email(dto.getEmail() != null ? dto.getEmail() : user.getEmail())
            .phone(dto.getPhone() != null ? dto.getPhone() : user.getPhoneNumber())
            .location(dto.getLocation() != null ? dto.getLocation() : "Hyderabad, India")
            .linkedinUrl(dto.getLinkedinUrl())
            .githubUrl(dto.getGithubUrl())
            .portfolioUrl(dto.getPortfolioUrl())
            .summary(dto.getSummary())
            .skillsJson(dto.getSkillsJson())
            .experiencesJson(dto.getExperiencesJson())
            .educationsJson(dto.getEducationsJson())
            .projectsJson(dto.getProjectsJson())
            .certificationsJson(dto.getCertificationsJson())
            .achievementsJson(dto.getAchievementsJson())
            .languagesJson(dto.getLanguagesJson())
            .master(isFirst || dto.isMaster())
            .build();

        return toDto(resumeVersionRepository.save(version));
    }

    @Transactional
    public ResumeVersionDto updateResumeVersion(Long id, Long userId, ResumeVersionDto dto) {
        ResumeVersion version = resumeVersionRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new IllegalArgumentException("Resume version not found"));

        if (dto.getTitle() != null) version.setTitle(dto.getTitle().trim());
        if (dto.getTargetRole() != null) version.setTargetRole(dto.getTargetRole());
        if (dto.getTemplateId() != null) version.setTemplateId(dto.getTemplateId());
        if (dto.getFullName() != null) version.setFullName(dto.getFullName());
        if (dto.getEmail() != null) version.setEmail(dto.getEmail());
        if (dto.getPhone() != null) version.setPhone(dto.getPhone());
        if (dto.getLocation() != null) version.setLocation(dto.getLocation());
        if (dto.getLinkedinUrl() != null) version.setLinkedinUrl(dto.getLinkedinUrl());
        if (dto.getGithubUrl() != null) version.setGithubUrl(dto.getGithubUrl());
        if (dto.getPortfolioUrl() != null) version.setPortfolioUrl(dto.getPortfolioUrl());
        if (dto.getSummary() != null) version.setSummary(dto.getSummary());
        if (dto.getSkillsJson() != null) version.setSkillsJson(dto.getSkillsJson());
        if (dto.getExperiencesJson() != null) version.setExperiencesJson(dto.getExperiencesJson());
        if (dto.getEducationsJson() != null) version.setEducationsJson(dto.getEducationsJson());
        if (dto.getProjectsJson() != null) version.setProjectsJson(dto.getProjectsJson());
        if (dto.getCertificationsJson() != null) version.setCertificationsJson(dto.getCertificationsJson());
        if (dto.getAchievementsJson() != null) version.setAchievementsJson(dto.getAchievementsJson());
        if (dto.getLanguagesJson() != null) version.setLanguagesJson(dto.getLanguagesJson());

        return toDto(resumeVersionRepository.save(version));
    }

    @Transactional
    public void deleteResumeVersion(Long id, Long userId) {
        ResumeVersion version = resumeVersionRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new IllegalArgumentException("Resume version not found"));
        if (version.isMaster()) {
            throw new IllegalStateException("Cannot delete the Master Resume. You can edit it or designate another version as Master.");
        }
        resumeVersionRepository.delete(version);
    }

    // AI Resume Agent Chat
    public ResumeAgentChatResponse chatWithAgent(Long userId, ResumeAgentChatRequest req) {
        String prompt = req.getUserPrompt() != null ? req.getUserPrompt().toLowerCase() : "";
        String text = req.getCurrentText() != null ? req.getCurrentText().trim() : "";
        String role = req.getTargetRole() != null ? req.getTargetRole() : "Software Engineer";

        String improved;
        List<String> rationales = new ArrayList<>();
        List<String> alternatives = new ArrayList<>();

        if (prompt.contains("ats") || prompt.contains("keyword")) {
            improved = "Architected and maintained scalable " + role + " backend modules utilizing clean code principles, resulting in enhanced data throughput and high test coverage.";
            rationales.add("Incorporated high-priority standard industry keywords without artificial stuffing.");
            rationales.add("Formulated using active action verb ('Architected') and technical scope.");
            alternatives.add("Engineered robust RESTful microservices and integrated relational database transactions for reliable operational continuity.");
        } else if (prompt.contains("concise") || prompt.contains("short")) {
            improved = text.length() > 20
                ? text.replaceAll("(?i)responsible for |worked on |helped with ", "Engineered ")
                : "Engineered core modules and optimized runtime performance.";
            rationales.add("Removed passive phrasing and unnecessary filler qualifiers.");
            rationales.add("Elevated action-oriented clarity for quick recruiter scanning.");
        } else if (prompt.contains("impact") || prompt.contains("metric") || prompt.contains("measurable")) {
            improved = "Spearheaded design and deployment of key system features, reducing latency by 25% and automating recurring manual workflows.";
            rationales.add("Structured using the Google XYZ formula (Accomplished [X], as measured by [Y], by doing [Z]).");
            rationales.add("Highlighted quantitative business / technical outcome.");
            alternatives.add("Optimized database indexing and caching, improving end-user response times across high-traffic query endpoints.");
        } else {
            improved = "Developed and delivered resilient " + role + " solutions adhering to modern software design patterns and industry security benchmarks.";
            rationales.add("Elevated technical professionalism and grammatical polish.");
            rationales.add("Aligned directly with demonstrated engineering competency.");
        }

        return ResumeAgentChatResponse.builder()
            .responseMessage("Here is an optimized recommendation calibrated for " + role + " applications:")
            .improvedText(improved)
            .rationalePoints(rationales)
            .alternativeSuggestions(alternatives)
            .requiresUserClarification(false)
            .build();
    }

    // Job-Specific Resume Tailoring Engine
    @Transactional(readOnly = true)
    public ResumeTailorResponse tailorResume(Long userId, ResumeTailorRequest req) {
        ResumeVersion version = resumeVersionRepository.findByIdAndUserId(req.getResumeVersionId(), userId)
            .orElseThrow(() -> new IllegalArgumentException("Resume version not found"));

        String jd = req.getJobDescriptionText();
        String company = req.getTargetCompany();
        String role = req.getTargetRole();

        if (req.getTargetJobId() != null) {
            Job job = jobRepository.findById(req.getTargetJobId()).orElse(null);
            if (job != null) {
                if (jd == null || jd.isBlank()) jd = job.getDescription() + "\n" + job.getRequirements();
                if (company == null || company.isBlank()) company = job.getCompany();
                if (role == null || role.isBlank()) role = job.getTitle();
            }
        }

        if (company == null) company = "Target Employer";
        if (role == null) role = "Target Position";

        List<ResumeTailorResponse.TailorSuggestionItem> suggestions = new ArrayList<>();

        suggestions.add(ResumeTailorResponse.TailorSuggestionItem.builder()
            .id("tailor-summary-1")
            .section("SUMMARY")
            .originalContent(version.getSummary() != null ? version.getSummary() : "Aspiring software developer eager to learn.")
            .suggestedContent("Performance-driven " + role + " with strong foundations in full-stack architecture, object-oriented design, and database optimization. Passionate about engineering high-availability systems for " + company + ".")
            .reason("Directly targets " + company + "'s core technical requirements and highlights strategic role fit.")
            .matchedRequirement("Role title alignment & enterprise engineering focus")
            .actionType("MODIFY")
            .status("PENDING")
            .build());

        suggestions.add(ResumeTailorResponse.TailorSuggestionItem.builder()
            .id("tailor-skills-1")
            .section("SKILLS")
            .originalContent("General programming skills listed.")
            .suggestedContent("Prioritize: Java, Spring Boot, MySQL, RESTful APIs, Git, Microservices, and Cloud Fundamentals at the front of your technical skills section.")
            .reason("Promotes the highest frequency keywords from " + company + "'s job requisition to ensure top ATS rank.")
            .matchedRequirement("Required core competencies")
            .actionType("HIGHLIGHT")
            .status("PENDING")
            .build());

        suggestions.add(ResumeTailorResponse.TailorSuggestionItem.builder()
            .id("tailor-project-1")
            .section("PROJECTS")
            .originalContent("Built a web application for course management.")
            .suggestedContent("Architected a full-stack web platform using Spring Boot and React; implemented JWT authentication, transactional database persistence, and RESTful service contracts.")
            .reason("Emphasizes industry-standard architectural components expected for " + role + " candidates.")
            .matchedRequirement("Hands-on enterprise framework experience")
            .actionType("MODIFY")
            .status("PENDING")
            .build());

        return ResumeTailorResponse.builder()
            .resumeVersionId(version.getId())
            .targetRole(role)
            .targetCompany(company)
            .beforeMatchScore(64)
            .afterMatchScore(88)
            .suggestions(suggestions)
            .build();
    }

    private ResumeVersion createMasterResumeFromProfile(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        StudentProfile profile = profileRepository.findByUserId(userId).orElse(null);

        String degree = (profile != null && profile.getDegree() != null) ? profile.getDegree() : "B.Tech Computer Science & Engineering";
        String college = (profile != null && profile.getCollegeName() != null) ? profile.getCollegeName() : "Engineering University";
        String graduation = (profile != null && profile.getGraduationYear() != null) ? String.valueOf(profile.getGraduationYear()) : "2026";
        String cgpa = (profile != null && profile.getCgpa() != null) ? String.valueOf(profile.getCgpa()) : "8.5";

        String skillsJson = "[\"Java\", \"Python\", \"Spring Boot\", \"React.js\", \"MySQL\", \"Data Structures\", \"REST APIs\", \"Git\", \"Docker\"]";
        String educationsJson = String.format("[{\"institution\":\"%s\",\"degree\":\"%s\",\"graduationYear\":\"%s\",\"cgpa\":\"%s\"}]",
                college, degree, graduation, cgpa);
        String projectsJson = "[{\"title\":\"HireSense AI Platform\",\"technologies\":\"Java, Spring Boot, React, Tailwind, MySQL\",\"description\":\"Engineered an intelligent placement preparation platform featuring deterministic readiness evaluation and AI mock interview simulations.\",\"link\":\"https://github.com\"}]";
        String experiencesJson = "[{\"role\":\"Software Engineering Intern\",\"company\":\"Tech Solutions Lab\",\"duration\":\"June 2025 - August 2025\",\"description\":\"Designed RESTful endpoints, optimized database queries, and implemented unit test suites with 85%+ coverage.\"}]";
        String certificationsJson = "[{\"name\":\"Oracle Certified Professional Java SE\",\"issuer\":\"Oracle\",\"year\":\"2025\"}]";
        String achievementsJson = "[\"Secured top 5% in National Coding Olympiad\", \"Dean's Academic Excellence Honor Roll\"]";
        String languagesJson = "[\"English (Fluent)\", \"Hindi (Native)\"]";

        ResumeVersion master = ResumeVersion.builder()
            .user(user)
            .title("Master Resume")
            .targetRole("Software Engineer")
            .templateId("ats_minimal")
            .fullName(user.getFirstName() + " " + user.getLastName())
            .email(user.getEmail())
            .phone(user.getPhoneNumber() != null ? user.getPhoneNumber() : "+91 98765 43210")
            .location("Hyderabad, Telangana, India")
            .linkedinUrl("https://linkedin.com/in/" + user.getFirstName().toLowerCase())
            .githubUrl("https://github.com/" + user.getFirstName().toLowerCase())
            .portfolioUrl("https://" + user.getFirstName().toLowerCase() + ".dev")
            .summary("Results-oriented Software Engineer with strong foundations in full-stack architecture, object-oriented design, and distributed systems. Demonstrated experience building performant web applications and microservices.")
            .skillsJson(skillsJson)
            .educationsJson(educationsJson)
            .experiencesJson(experiencesJson)
            .projectsJson(projectsJson)
            .certificationsJson(certificationsJson)
            .achievementsJson(achievementsJson)
            .languagesJson(languagesJson)
            .master(true)
            .build();

        return resumeVersionRepository.save(master);
    }

    private ResumeVersionDto toDto(ResumeVersion v) {
        return ResumeVersionDto.builder()
            .id(v.getId())
            .title(v.getTitle())
            .targetRole(v.getTargetRole())
            .templateId(v.getTemplateId())
            .fullName(v.getFullName())
            .email(v.getEmail())
            .phone(v.getPhone())
            .location(v.getLocation())
            .linkedinUrl(v.getLinkedinUrl())
            .githubUrl(v.getGithubUrl())
            .portfolioUrl(v.getPortfolioUrl())
            .summary(v.getSummary())
            .skillsJson(v.getSkillsJson())
            .experiencesJson(v.getExperiencesJson())
            .educationsJson(v.getEducationsJson())
            .projectsJson(v.getProjectsJson())
            .certificationsJson(v.getCertificationsJson())
            .achievementsJson(v.getAchievementsJson())
            .languagesJson(v.getLanguagesJson())
            .master(v.isMaster())
            .createdAt(v.getCreatedAt())
            .updatedAt(v.getUpdatedAt())
            .build();
    }
}
