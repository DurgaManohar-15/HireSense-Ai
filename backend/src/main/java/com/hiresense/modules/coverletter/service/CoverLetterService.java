package com.hiresense.modules.coverletter.service;

import com.hiresense.modules.ai.AIService;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.coverletter.dto.CoverLetterDto;
import com.hiresense.modules.coverletter.dto.CoverLetterGenerateRequest;
import com.hiresense.modules.coverletter.model.CoverLetter;
import com.hiresense.modules.coverletter.repository.CoverLetterRepository;
import com.hiresense.modules.job.model.Job;
import com.hiresense.modules.job.repository.JobRepository;
import com.hiresense.modules.profile.model.StudentProfile;
import com.hiresense.modules.profile.repository.StudentProfileRepository;
import com.hiresense.modules.resume.model.Resume;
import com.hiresense.modules.resume.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CoverLetterService {

    private final CoverLetterRepository coverLetterRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository profileRepository;
    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;
    private final AIService aiService;

    @Transactional(readOnly = true)
    public List<CoverLetterDto> getMyCoverLetters(Long userId) {
        return coverLetterRepository.findByUserIdOrderByUpdatedAtDesc(userId)
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CoverLetterDto getCoverLetterById(Long id, Long userId) {
        CoverLetter cl = coverLetterRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new IllegalArgumentException("Cover letter not found"));
        return toDto(cl);
    }

    @Transactional
    public CoverLetterDto generateCoverLetter(Long userId, CoverLetterGenerateRequest req) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        StudentProfile profile = profileRepository.findByUserId(userId).orElse(null);

        String company = req.getCompanyName();
        String role = req.getRoleTitle();
        String jdText = req.getJobDescription();

        if (req.getJobId() != null) {
            Job job = jobRepository.findById(req.getJobId()).orElse(null);
            if (job != null) {
                if (company == null || company.isBlank()) company = job.getCompany();
                if (role == null || role.isBlank()) role = job.getTitle();
                if (jdText == null || jdText.isBlank()) jdText = job.getDescription() + "\n" + job.getRequirements();
            }
        }

        if (company == null || company.isBlank()) company = "Hiring Team";
        if (role == null || role.isBlank()) role = "Software Engineer";

        String tone = req.getTone() != null ? req.getTone() : "PROFESSIONAL";

        String candidateName = user.getFirstName() + " " + user.getLastName();
        String degree = profile != null && profile.getDegree() != null ? profile.getDegree() : "Computer Science & Engineering";
        String college = profile != null && profile.getCollegeName() != null ? profile.getCollegeName() : "University";
        String skillsList = (profile != null && profile.getSkills() != null && !profile.getSkills().isEmpty())
            ? profile.getSkills().stream().map(s -> s.getSkill() != null ? s.getSkill().getName() : "").filter(s -> !s.isEmpty()).collect(Collectors.joining(", "))
            : "Java, Data Structures, RESTful APIs, Spring Boot, React, SQL";

        // Retrieve Resume text if resumeId or resumeText provided
        String resumeText = req.getResumeText();
        if (req.getResumeId() != null) {
            Resume resume = resumeRepository.findByIdAndUserId(req.getResumeId(), userId).orElse(null);
            if (resume != null && resume.getRawText() != null && !resume.getRawText().isBlank()) {
                resumeText = resume.getRawText();
            }
        }

        log.info("Generating AI Cover Letter for user {} applying to {} at {} (Resume provided: {}, JD provided: {}, Custom instructions: {})",
                userId, role, company, (resumeText != null && !resumeText.isBlank()),
                (jdText != null && !jdText.isBlank()), (req.getAdditionalInstructions() != null && !req.getAdditionalInstructions().isBlank()));

        String letterContent = aiService.generateCoverLetter(
                candidateName,
                user.getEmail(),
                user.getPhoneNumber(),
                company,
                role,
                jdText,
                resumeText,
                tone,
                req.getAdditionalInstructions(),
                skillsList,
                degree,
                college
        );

        if (letterContent == null || letterContent.isBlank()) {
            letterContent = generateLetterText(candidateName, user.getEmail(), user.getPhoneNumber(),
                    company, role, degree, college, skillsList, tone, jdText);
        }

        CoverLetter cl = CoverLetter.builder()
            .user(user)
            .jobId(req.getJobId())
            .companyName(company)
            .roleTitle(role)
            .title(role + " - " + company)
            .tone(tone)
            .content(letterContent)
            .build();

        return toDto(coverLetterRepository.save(cl));
    }

    @Transactional
    public CoverLetterDto updateCoverLetter(Long id, Long userId, CoverLetterDto dto) {
        CoverLetter cl = coverLetterRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new IllegalArgumentException("Cover letter not found"));

        if (dto.getTitle() != null) cl.setTitle(dto.getTitle());
        if (dto.getContent() != null) cl.setContent(dto.getContent());
        if (dto.getTone() != null) cl.setTone(dto.getTone());

        return toDto(coverLetterRepository.save(cl));
    }

    @Transactional
    public void deleteCoverLetter(Long id, Long userId) {
        CoverLetter cl = coverLetterRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new IllegalArgumentException("Cover letter not found"));
        coverLetterRepository.delete(cl);
    }

    private String generateLetterText(String candidateName, String email, String phone,
                                     String company, String role, String degree, String college,
                                     String skillsList, String tone, String jd) {
        StringBuilder sb = new StringBuilder();
        sb.append(candidateName).append("\n");
        if (email != null) sb.append(email);
        if (phone != null) sb.append(" | ").append(phone);
        sb.append("\n\nDate: ").append(java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("MMMM d, yyyy"))).append("\n\n");
        sb.append("To,\nThe Hiring Manager / Campus Recruitment Team\n");
        sb.append(company).append("\n\n");
        sb.append("Subject: Application for the position of ").append(role).append("\n\n");
        sb.append("Dear Hiring Team at ").append(company).append(",\n\n");

        if ("CONVERSATIONAL".equalsIgnoreCase(tone)) {
            sb.append("I am excited to submit my application for the ").append(role)
              .append(" role at ").append(company)
              .append(". Having followed ").append(company)
              .append("'s innovations and engineering standards, I am eager to bring my hands-on technical background in ")
              .append(skillsList).append(" to contribute directly to your team's mission.\n\n");
        } else if ("IMPACT_DRIVEN".equalsIgnoreCase(tone)) {
            sb.append("I am writing to express my strong candidacy for the ").append(role)
              .append(" position at ").append(company)
              .append(". With a rigorous academic foundation in ").append(degree)
              .append(" from ").append(college)
              .append(" and proven project execution across ").append(skillsList)
              .append(", I am focused on delivering scalable, high-performance software solutions from day one.\n\n");
        } else {
            sb.append("I am writing to respectfully express my enthusiastic interest in the ").append(role)
              .append(" vacancy at ").append(company)
              .append(". As a graduating ").append(degree)
              .append(" scholar from ").append(college)
              .append(", I have cultivated solid competencies in software engineering and modern development paradigms.\n\n");
        }

        sb.append("Throughout my academic journey and technical projects, I have developed disciplined capabilities in ")
          .append(skillsList)
          .append(". I have consistently focused on writing clean, maintainable code, solving complex algorithmic problems, and architecting resilient end-to-end applications. ")
          .append("My demonstrated ability to quickly master new frameworks and deliver under agile project sprints aligns directly with the expectations of the ")
          .append(role).append(" role.\n\n");

        sb.append("What particularly attracts me to ").append(company)
          .append(" is your collaborative culture of continuous learning and customer-centric technological innovation. I welcome the opportunity to discuss how my academic rigor, technical toolkit, and energetic problem-solving approach can generate immediate value for your engineering department.\n\n");

        sb.append("Thank you for your time and consideration. I look forward to the possibility of discussing my candidacy in an interview.\n\n");
        sb.append("Sincerely,\n\n");
        sb.append(candidateName);

        return sb.toString();
    }

    private CoverLetterDto toDto(CoverLetter cl) {
        return CoverLetterDto.builder()
            .id(cl.getId())
            .jobId(cl.getJobId())
            .title(cl.getTitle())
            .companyName(cl.getCompanyName())
            .roleTitle(cl.getRoleTitle())
            .tone(cl.getTone())
            .content(cl.getContent())
            .createdAt(cl.getCreatedAt())
            .updatedAt(cl.getUpdatedAt())
            .build();
    }
}
