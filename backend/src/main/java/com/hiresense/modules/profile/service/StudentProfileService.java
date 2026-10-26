package com.hiresense.modules.profile.service;

import com.hiresense.common.exception.ResourceNotFoundException;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.profile.dto.*;
import com.hiresense.modules.profile.model.*;
import com.hiresense.modules.profile.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentProfileService {

    private final StudentProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final TargetCompanyRepository targetCompanyRepository;
    private final SkillRepository skillRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final StudentProjectRepository studentProjectRepository;
    private final StudentCertificationRepository studentCertificationRepository;
    private final TargetCompanyService targetCompanyService;

    @Transactional(readOnly = true)
    public StudentProfileResponse getProfileByUserId(Long userId) {
        return profileRepository.findByUserId(userId)
                .map(this::mapToResponse)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                    return StudentProfileResponse.builder()
                            .userId(user.getId())
                            .email(user.getEmail())
                            .firstName(user.getFirstName())
                            .lastName(user.getLastName())
                            .profileComplete(false)
                            .skills(new ArrayList<>())
                            .projects(new ArrayList<>())
                            .certifications(new ArrayList<>())
                            .build();
                });
    }

    @Transactional
    public StudentProfileResponse createOrUpdateProfile(Long userId, StudentProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Update student's name if provided
        if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
            user.setFirstName(request.getFirstName().trim());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName().trim());
        }
        userRepository.save(user);

        TargetCompany targetCompany = null;
        if (request.getTargetCompanyId() != null) {
            targetCompany = targetCompanyRepository.findById(request.getTargetCompanyId())
                    .orElse(null);
        }

        StudentProfile profile = profileRepository.findByUserId(userId)
                .orElse(StudentProfile.builder().user(user).build());

        profile.setCollegeName(cleanString(request.getCollegeName()));
        profile.setDegree(cleanString(request.getDegree()));
        profile.setBranch(cleanString(request.getBranch()));
        profile.setGraduationYear(request.getGraduationYear());
        profile.setCgpa(request.getCgpa());
        profile.setTargetRole(cleanString(request.getTargetRole()));
        profile.setTargetCompany(targetCompany);
        profile.setTargetTimelineWeeks(request.getTargetTimelineWeeks());
        profile.setGithubUrl(cleanString(request.getGithubUrl()));
        profile.setLinkedinUrl(cleanString(request.getLinkedinUrl()));
        profile.setPortfolioUrl(cleanString(request.getPortfolioUrl()));
        profile.setBio(cleanString(request.getBio()));

        StudentProfile savedProfile = profileRepository.saveAndFlush(profile);

        // Update skills if provided
        if (request.getSkills() != null) {
            savedProfile.getSkills().clear();
            profileRepository.saveAndFlush(savedProfile);
            java.util.Set<String> seenSkillNames = new java.util.HashSet<>();
            for (SkillDto skillDto : request.getSkills()) {
                if (skillDto == null || skillDto.getName() == null || skillDto.getName().isBlank()) continue;
                String sName = skillDto.getName().trim();
                if (!seenSkillNames.add(sName.toLowerCase())) continue;

                Skill skill = skillRepository.findByNameIgnoreCase(sName)
                        .orElseGet(() -> skillRepository.save(Skill.builder()
                                .name(sName)
                                .category(skillDto.getCategory() != null ? skillDto.getCategory() : "GENERAL")
                                .build()));

                StudentSkill studentSkill = StudentSkill.builder()
                        .profile(savedProfile)
                        .skill(skill)
                        .proficiencyLevel(skillDto.getProficiencyLevel() != null ? skillDto.getProficiencyLevel() : SkillProficiency.BEGINNER)
                        .verifiedByAssessment(skillDto.isVerifiedByAssessment())
                        .build();

                savedProfile.getSkills().add(studentSkill);
            }
        }

        // Update projects if provided
        if (request.getProjects() != null) {
            savedProfile.getProjects().clear();
            profileRepository.saveAndFlush(savedProfile);
            for (StudentProjectDto pDto : request.getProjects()) {
                if (pDto == null || pDto.getTitle() == null || pDto.getTitle().isBlank()) continue;
                StudentProject project = StudentProject.builder()
                        .profile(savedProfile)
                        .title(pDto.getTitle().trim())
                        .description(pDto.getDescription() != null ? pDto.getDescription().trim() : "")
                        .technologiesUsed(pDto.getTechnologiesUsed() != null ? pDto.getTechnologiesUsed().trim() : "")
                        .githubLink(cleanString(pDto.getGithubLink()))
                        .liveDemoLink(cleanString(pDto.getLiveDemoLink()))
                        .build();
                savedProfile.getProjects().add(project);
            }
        }

        // Update certifications if provided
        if (request.getCertifications() != null) {
            savedProfile.getCertifications().clear();
            profileRepository.saveAndFlush(savedProfile);
            for (StudentCertificationDto cDto : request.getCertifications()) {
                if (cDto == null || cDto.getTitle() == null || cDto.getTitle().isBlank()) continue;
                StudentCertification cert = StudentCertification.builder()
                        .profile(savedProfile)
                        .title(cDto.getTitle().trim())
                        .issuingOrganization(cDto.getIssuingOrganization() != null ? cDto.getIssuingOrganization().trim() : "")
                        .issueDate(cDto.getIssueDate())
                        .credentialId(cleanString(cDto.getCredentialId()))
                        .credentialUrl(cleanString(cDto.getCredentialUrl()))
                        .build();
                savedProfile.getCertifications().add(cert);
            }
        }

        savedProfile = profileRepository.saveAndFlush(savedProfile);
        return mapToResponse(savedProfile);
    }

    private String cleanString(String val) {
        if (val == null || val.trim().isEmpty()) return null;
        return val.trim();
    }

    private StudentProfileResponse mapToResponse(StudentProfile profile) {
        User user = profile.getUser();

        List<SkillDto> skillDtos = profile.getSkills() != null ? profile.getSkills().stream()
                .map(ss -> SkillDto.builder()
                        .id(ss.getId())
                        .name(ss.getSkill().getName())
                        .category(ss.getSkill().getCategory())
                        .proficiencyLevel(ss.getProficiencyLevel())
                        .verifiedByAssessment(ss.isVerifiedByAssessment())
                        .build())
                .collect(Collectors.toList()) : new ArrayList<>();

        List<StudentProjectDto> projectDtos = profile.getProjects() != null ? profile.getProjects().stream()
                .map(p -> StudentProjectDto.builder()
                        .id(p.getId())
                        .title(p.getTitle())
                        .description(p.getDescription())
                        .technologiesUsed(p.getTechnologiesUsed())
                        .githubLink(p.getGithubLink())
                        .liveDemoLink(p.getLiveDemoLink())
                        .build())
                .collect(Collectors.toList()) : new ArrayList<>();

        List<StudentCertificationDto> certDtos = profile.getCertifications() != null ? profile.getCertifications().stream()
                .map(c -> StudentCertificationDto.builder()
                        .id(c.getId())
                        .title(c.getTitle())
                        .issuingOrganization(c.getIssuingOrganization())
                        .issueDate(c.getIssueDate())
                        .credentialId(c.getCredentialId())
                        .credentialUrl(c.getCredentialUrl())
                        .build())
                .collect(Collectors.toList()) : new ArrayList<>();

        TargetCompanyResponse companyResponse = profile.getTargetCompany() != null
                ? targetCompanyService.mapToResponse(profile.getTargetCompany())
                : null;

        return StudentProfileResponse.builder()
                .id(profile.getId())
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .collegeName(profile.getCollegeName())
                .degree(profile.getDegree())
                .branch(profile.getBranch())
                .graduationYear(profile.getGraduationYear())
                .cgpa(profile.getCgpa())
                .targetRole(profile.getTargetRole())
                .targetCompany(companyResponse)
                .targetTimelineWeeks(profile.getTargetTimelineWeeks())
                .githubUrl(profile.getGithubUrl())
                .linkedinUrl(profile.getLinkedinUrl())
                .portfolioUrl(profile.getPortfolioUrl())
                .bio(profile.getBio())
                .skills(skillDtos)
                .projects(projectDtos)
                .certifications(certDtos)
                .profileComplete(true)
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
