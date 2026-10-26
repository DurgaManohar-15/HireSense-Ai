package com.hiresense.modules.job.service;

import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.job.dto.JobDto;
import com.hiresense.modules.job.dto.JobMatchDto;
import com.hiresense.modules.job.model.Job;
import com.hiresense.modules.job.model.SavedJob;
import com.hiresense.modules.job.repository.JobRepository;
import com.hiresense.modules.job.repository.SavedJobRepository;
import com.hiresense.modules.profile.model.StudentProfile;
import com.hiresense.modules.profile.repository.StudentProfileRepository;
import com.hiresense.modules.profile.model.StudentSkill;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobService {

    private final JobRepository jobRepository;
    private final SavedJobRepository savedJobRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository profileRepository;

    @PostConstruct
    public void initDefaultJobs() {
        if (jobRepository.count() == 0) {
            log.info("Seeding production-grade initial tech job postings...");
            List<Job> jobs = Arrays.asList(
                Job.builder()
                    .title("Software Development Engineer I (SDE 1)")
                    .company("Amazon")
                    .location("Hyderabad, Telangana")
                    .country("India")
                    .industry("E-Commerce & Cloud Computing")
                    .experienceLevel("Fresher")
                    .salaryRange("₹16,00,000 - ₹24,00,000 PA")
                    .workType("HYBRID")
                    .jobType("FULL_TIME")
                    .description("Join our Core Commerce team to design and build large-scale distributed microservices. You will collaborate with principal engineers to solve complex low-latency challenges.")
                    .requirements("B.Tech/B.E. in Computer Science or related engineering discipline.\nStrong foundations in Java or C++, Object-Oriented Design, and Data Structures.\nBasic familiarity with AWS, RESTful APIs, and Relational Databases.")
                    .responsibilities("Write clean, tested, and maintainable production code.\nParticipate in architecture reviews and on-call rotations.\nOptimize backend performance and database query latencies.")
                    .skills("Java, Data Structures, Algorithms, Spring Boot, AWS, MySQL, System Design")
                    .source("Amazon Careers Direct")
                    .applyUrl("https://www.amazon.jobs")
                    .active(true)
                    .build(),

                Job.builder()
                    .title("Associate Analyst / Software Engineer")
                    .company("Deloitte")
                    .location("Bengaluru, Karnataka")
                    .country("India")
                    .industry("Management & Technology Consulting")
                    .experienceLevel("Fresher")
                    .salaryRange("₹7,50,000 - ₹11,00,000 PA")
                    .workType("HYBRID")
                    .jobType("FULL_TIME")
                    .description("Deloitte Technology Services is hiring enthusiastic campus graduates for client digital transformation projects across cloud, enterprise modernization, and data engineering.")
                    .requirements("B.Tech/MCA/M.Sc in CS, IT, or Electronics.\nSolid analytical, verbal, and technical problem-solving capabilities.\nProficiency in SQL, Java or Python, and basic web technologies.")
                    .responsibilities("Deliver software modules according to client specifications.\nWrite unit tests and automate integration pipelines.\nInteract with multinational client stakeholders.")
                    .skills("Java, Python, SQL, REST APIs, Git, React, Problem Solving")
                    .source("Deloitte Campus Drive")
                    .applyUrl("https://jobs2.deloitte.com")
                    .active(true)
                    .build(),

                Job.builder()
                    .title("Junior Full Stack Developer")
                    .company("Microsoft")
                    .location("Hyderabad, Telangana")
                    .country("India")
                    .industry("Cloud & Enterprise Software")
                    .experienceLevel("0-1 Years")
                    .salaryRange("₹18,00,000 - ₹26,00,000 PA")
                    .workType("HYBRID")
                    .jobType("FULL_TIME")
                    .description("We are looking for a Junior Full Stack Developer to build delightful end-user user interfaces and resilient backend microservices for Microsoft 365 cloud ecosystems.")
                    .requirements("Demonstrated proficiency in React/TypeScript and backend systems (Node.js/C#/Java).\nFamiliarity with CI/CD workflows and cloud infrastructure.\nPassion for high accessibility and responsive UI.")
                    .responsibilities("Implement accessible web frontend components in React.\nBuild resilient RESTful endpoints with authentication and rate limiting.\nMonitor application telemetry and resolve production anomalies.")
                    .skills("React, TypeScript, JavaScript, Node.js, REST APIs, Git, Cloud Computing")
                    .source("Microsoft University Recruiting")
                    .applyUrl("https://careers.microsoft.com")
                    .active(true)
                    .build(),

                Job.builder()
                    .title("Systems Engineer (Digital Specialist)")
                    .company("Infosys")
                    .location("Pune, Maharashtra")
                    .country("India")
                    .industry("IT Services & Global Digital Transformation")
                    .experienceLevel("Fresher")
                    .salaryRange("₹6,25,000 - ₹9,50,000 PA")
                    .workType("HYBRID")
                    .jobType("FULL_TIME")
                    .description("Infosys Digital Specialist Engineers develop cutting-edge solutions across AI, Open Source, Big Data, and Cloud platforms for Fortune 500 enterprises.")
                    .requirements("BE/B.Tech/M.Tech with strong computer science fundamentals.\nExcellent coding capability in any modern language (Java, Python, C++).\nSolid grasp of relational databases and algorithms.")
                    .responsibilities("Participate in agile sprint development cycles.\nDevelop software components and microservices.\nEnsure code quality through peer reviews and automated testing.")
                    .skills("Java, Python, Spring Boot, MySQL, HTML5, CSS3, Data Structures")
                    .source("Infosys InfyTQ / Campus")
                    .applyUrl("https://www.infosys.com/careers")
                    .active(true)
                    .build(),

                Job.builder()
                    .title("Graduate Technology Trainee (TCS Ninja / Digital)")
                    .company("TCS")
                    .location("Chennai, Tamil Nadu")
                    .country("India")
                    .industry("IT Services & Consulting")
                    .experienceLevel("Fresher")
                    .salaryRange("₹3,60,000 - ₹7,20,000 PA")
                    .workType("ONSITE")
                    .jobType("FULL_TIME")
                    .description("TCS is hiring engineering graduates to pioneer intelligent automation and enterprise cloud migration programs across banking, retail, and healthcare.")
                    .requirements("Graduating B.E/B.Tech with minimum 60% throughout academics.\nClear understanding of OOP, DBMS, and OS fundamentals.\nStrong logical reasoning and communication skills.")
                    .responsibilities("Analyze user requirements and develop program specifications.\nExecute unit and system integration testing.\nDocument deployment procedures.")
                    .skills("Java, C++, Python, SQL, DBMS, OOP, Operating Systems")
                    .source("TCS NQT Portal")
                    .applyUrl("https://www.tcs.com/careers")
                    .active(true)
                    .build(),

                Job.builder()
                    .title("Frontend Software Engineer (React)")
                    .company("Razorpay")
                    .location("Bengaluru, Karnataka")
                    .country("India")
                    .industry("Financial Technology & Payments")
                    .experienceLevel("0-2 Years")
                    .salaryRange("₹14,00,000 - ₹20,00,000 PA")
                    .workType("REMOTE")
                    .jobType("FULL_TIME")
                    .description("Help shape the future of digital payments across India. You will build high-conversion merchant checkout flows and sleek financial analytics dashboards.")
                    .requirements("Deep understanding of modern JavaScript (ES6+), React 18, and CSS architectures.\nExperience with state management, web performance profiling, and REST APIs.\nFamiliarity with Jest and Cypress testing.")
                    .responsibilities("Architect modular, reusable React UI components.\nCollaborate closely with product designers and backend engineers.\nEnsure sub-second page loads across low-bandwidth mobile networks.")
                    .skills("React, JavaScript, TypeScript, Tailwind CSS, Redux, REST APIs, Web Performance")
                    .source("Razorpay Careers")
                    .applyUrl("https://razorpay.com/jobs")
                    .active(true)
                    .build()
            );
            jobRepository.saveAll(jobs);
            log.info("Saved {} baseline job postings.", jobs.size());
        }
    }

    @Transactional(readOnly = true)
    public List<JobDto> searchJobs(Long userId, String query, String location, String workType, String experienceLevel) {
        List<Job> jobs = jobRepository.searchJobs(
            (query != null && !query.trim().isEmpty()) ? query.trim() : null,
            (location != null && !location.trim().isEmpty()) ? location.trim() : null,
            (workType != null && !workType.trim().isEmpty() && !workType.equalsIgnoreCase("ALL")) ? workType.trim() : null,
            (experienceLevel != null && !experienceLevel.trim().isEmpty() && !experienceLevel.equalsIgnoreCase("ALL")) ? experienceLevel.trim() : null
        );

        Set<Long> savedJobIds = (userId != null)
            ? savedJobRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(sj -> sj.getJob().getId()).collect(Collectors.toSet())
            : Collections.emptySet();

        Optional<StudentProfile> profileOpt = (userId != null) ? profileRepository.findByUserId(userId) : Optional.empty();

        return jobs.stream().map(job -> toDto(job, savedJobIds.contains(job.getId()), profileOpt.orElse(null))).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobDto getJobById(Long jobId, Long userId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new IllegalArgumentException("Job posting not found with ID: " + jobId));

        boolean saved = (userId != null) && savedJobRepository.existsByUserIdAndJobId(userId, jobId);
        Optional<StudentProfile> profileOpt = (userId != null) ? profileRepository.findByUserId(userId) : Optional.empty();

        return toDto(job, saved, profileOpt.orElse(null));
    }

    @Transactional
    public boolean toggleSaveJob(Long userId, Long jobId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new IllegalArgumentException("Job not found"));

        Optional<SavedJob> existing = savedJobRepository.findByUserIdAndJobId(userId, jobId);
        if (existing.isPresent()) {
            savedJobRepository.delete(existing.get());
            return false; // un-saved
        } else {
            StudentProfile profile = profileRepository.findByUserId(userId).orElse(null);
            int matchScore = calculateBasicMatchScore(job, profile);
            SavedJob savedJob = SavedJob.builder()
                .user(user)
                .job(job)
                .matchScore(matchScore)
                .build();
            savedJobRepository.save(savedJob);
            return true; // saved
        }
    }

    @Transactional(readOnly = true)
    public List<JobDto> getSavedJobs(Long userId) {
        List<SavedJob> saved = savedJobRepository.findByUserIdOrderByCreatedAtDesc(userId);
        Optional<StudentProfile> profileOpt = profileRepository.findByUserId(userId);

        return saved.stream()
            .map(sj -> toDto(sj.getJob(), true, profileOpt.orElse(null)))
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobMatchDto calculateMatchBreakdown(Long jobId, Long userId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new IllegalArgumentException("Job not found"));
        StudentProfile profile = profileRepository.findByUserId(userId).orElse(null);

        List<String> requiredSkills = parseSkills(job.getSkills());
        List<String> studentSkills = (profile != null && profile.getSkills() != null)
            ? profile.getSkills().stream().map(s -> s.getSkill() != null ? s.getSkill().getName() : "").filter(s -> !s.isEmpty()).collect(Collectors.toList())
            : Collections.emptyList();

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String req : requiredSkills) {
            boolean found = studentSkills.stream().anyMatch(s -> s.equalsIgnoreCase(req) || req.toLowerCase().contains(s.toLowerCase()));
            if (found) {
                matched.add(req);
            } else {
                missing.add(req);
            }
        }

        int skillsScore = requiredSkills.isEmpty() ? 70 : (int) Math.round(((double) matched.size() / requiredSkills.size()) * 100);
        int expScore = 85; // Campus / fresher calibrated
        int eduScore = (profile != null && profile.getCollegeName() != null) ? 90 : 75;
        int locScore = 80;
        int roleScore = 85;

        int overall = (int) Math.round((skillsScore * 0.45) + (expScore * 0.20) + (eduScore * 0.15) + (locScore * 0.10) + (roleScore * 0.10));

        List<String> reasons = new ArrayList<>();
        if (!matched.isEmpty()) {
            reasons.add("Demonstrated core proficiency in: " + String.join(", ", matched));
        }
        if (profile != null && profile.getDegree() != null) {
            reasons.add("Educational background (" + profile.getDegree() + ") matches role prerequisites.");
        }
        reasons.add("Experience level aligns with " + job.getExperienceLevel() + " requisites.");

        List<String> gaps = new ArrayList<>();
        if (!missing.isEmpty()) {
            gaps.add("Noticeable skill opportunities: " + String.join(", ", missing));
        } else {
            gaps.add("No critical skill deficiencies detected for this vacancy.");
        }

        return JobMatchDto.builder()
            .jobId(job.getId())
            .jobTitle(job.getTitle())
            .company(job.getCompany())
            .overallMatchScore(Math.min(98, Math.max(30, overall)))
            .skillsMatchScore(skillsScore)
            .experienceMatchScore(expScore)
            .educationMatchScore(eduScore)
            .locationMatchScore(locScore)
            .roleMatchScore(roleScore)
            .matchedSkills(matched)
            .missingSkills(missing)
            .matchReasons(reasons)
            .potentialGaps(gaps)
            .build();
    }

    private JobDto toDto(Job job, boolean saved, StudentProfile profile) {
        List<String> skills = parseSkills(job.getSkills());
        int matchScore = calculateBasicMatchScore(job, profile);

        return JobDto.builder()
            .id(job.getId())
            .title(job.getTitle())
            .company(job.getCompany())
            .location(job.getLocation())
            .country(job.getCountry())
            .industry(job.getIndustry())
            .experienceLevel(job.getExperienceLevel())
            .salaryRange(job.getSalaryRange())
            .workType(job.getWorkType())
            .jobType(job.getJobType())
            .description(job.getDescription())
            .requirements(job.getRequirements())
            .responsibilities(job.getResponsibilities())
            .skills(skills)
            .source(job.getSource())
            .applyUrl(job.getApplyUrl())
            .active(job.isActive())
            .createdAt(job.getCreatedAt())
            .saved(saved)
            .matchScore(matchScore)
            .build();
    }

    private int calculateBasicMatchScore(Job job, StudentProfile profile) {
        if (profile == null || profile.getSkills() == null || profile.getSkills().isEmpty()) {
            return 65; // baseline estimate
        }
        List<String> req = parseSkills(job.getSkills());
        if (req.isEmpty()) return 75;

        List<String> studentSkills = profile.getSkills().stream()
            .map(s -> s.getSkill() != null ? s.getSkill().getName() : "")
            .filter(s -> !s.isEmpty())
            .collect(Collectors.toList());

        long matchCount = req.stream()
            .filter(r -> studentSkills.stream().anyMatch(s -> s.equalsIgnoreCase(r) || r.toLowerCase().contains(s.toLowerCase())))
            .count();

        int score = (int) Math.round(((double) matchCount / req.size()) * 40 + 55);
        return Math.min(96, Math.max(45, score));
    }

    private List<String> parseSkills(String skillsStr) {
        if (skillsStr == null || skillsStr.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return Arrays.stream(skillsStr.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .collect(Collectors.toList());
    }
}
