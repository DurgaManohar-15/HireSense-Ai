package com.hiresense.modules.resume.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiresense.common.exception.ResourceNotFoundException;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.resume.dto.JobDescriptionCreateRequest;
import com.hiresense.modules.resume.dto.JobDescriptionDto;
import com.hiresense.modules.resume.model.JobDescription;
import com.hiresense.modules.resume.repository.JobDescriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobDescriptionService {

    private final JobDescriptionRepository jdRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public JobDescriptionDto createJobDescription(Long userId, JobDescriptionCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Extract structured requirements
        JobDescriptionDto extracted = parseAndExtractJd(request.getTitle(), request.getCompany(), request.getLocation(), request.getRawText());

        String jsonString;
        try {
            jsonString = objectMapper.writeValueAsString(extracted);
        } catch (Exception e) {
            log.warn("Failed to serialize extracted JD JSON: {}", e.getMessage());
            jsonString = "{}";
        }

        JobDescription jd = JobDescription.builder()
                .user(user)
                .title(request.getTitle().trim())
                .company(request.getCompany() != null ? request.getCompany().trim() : "Tech Company")
                .location(request.getLocation() != null ? request.getLocation().trim() : "Remote / Hybrid")
                .rawText(request.getRawText().trim())
                .extractedJson(jsonString)
                .active(true)
                .build();

        JobDescription saved = jdRepository.save(jd);
        extracted.setId(saved.getId());
        extracted.setCreatedAt(saved.getCreatedAt());
        extracted.setActive(saved.isActive());
        return extracted;
    }

    @Transactional(readOnly = true)
    public List<JobDescriptionDto> getMyJobDescriptions(Long userId) {
        return jdRepository.findByUserIdAndActiveTrueOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobDescriptionDto getJobDescriptionById(Long id, Long userId) {
        JobDescription jd = jdRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job description not found or unauthorized"));
        return mapToDto(jd);
    }

    @Transactional
    public void deleteJobDescription(Long id, Long userId) {
        JobDescription jd = jdRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job description not found or unauthorized"));
        jd.setActive(false);
        jdRepository.save(jd);
    }

    public JobDescriptionDto parseAndExtractJd(String title, String company, String location, String rawText) {
        String lower = rawText.toLowerCase();

        List<String> requiredSkills = new ArrayList<>();
        List<String> preferredSkills = new ArrayList<>();
        List<String> progLangs = new ArrayList<>();
        List<String> frameworks = new ArrayList<>();
        List<String> databases = new ArrayList<>();
        List<String> toolsCloud = new ArrayList<>();
        List<String> softSkills = new ArrayList<>();

        for (Map.Entry<String, List<String>> entry : AdvancedResumeScorerService.SKILL_TAXONOMY.entrySet()) {
            String category = entry.getKey();
            for (String skill : entry.getValue()) {
                Pattern p = Pattern.compile("\\b" + Pattern.quote(skill.toLowerCase()) + "\\b", Pattern.CASE_INSENSITIVE);
                if (p.matcher(lower).find()) {
                    requiredSkills.add(skill);

                    switch (category) {
                        case "PROGRAMMING_LANGUAGES" -> progLangs.add(skill);
                        case "FRAMEWORKS" -> frameworks.add(skill);
                        case "DATABASES" -> databases.add(skill);
                        case "CLOUD_DEVOPS", "TOOLS_METHODOLOGIES" -> toolsCloud.add(skill);
                        case "SOFT_SKILLS" -> softSkills.add(skill);
                    }
                }
            }
        }

        // Detect preferred/bonus keywords
        if (lower.contains("preferred") || lower.contains("good to have") || lower.contains("plus") || lower.contains("bonus")) {
            // Segregate some skills as preferred if in proximity
            if (toolsCloud.size() > 2) {
                preferredSkills.add(toolsCloud.get(toolsCloud.size() - 1));
            }
        }

        // Education & Experience heuristics
        String exp = "0-2 years (Entry / Graduate Level)";
        if (lower.contains("3+ years") || lower.contains("3 years") || lower.contains("senior")) {
            exp = "3-5+ years (Mid / Senior Level)";
        } else if (lower.contains("intern") || lower.contains("freshers") || lower.contains("entry level")) {
            exp = "0-1 years (Fresher / Internship)";
        }

        String edu = "Bachelor's degree in Computer Science, Engineering, or related STEM field";
        if (lower.contains("master") || lower.contains("m.tech") || lower.contains("ms")) {
            edu = "Bachelor's or Master's in Computer Science / IT / Related Field";
        }

        List<String> responsibilities = List.of(
                "Design, develop, and maintain robust, scalable software applications and RESTful APIs.",
                "Collaborate across cross-functional teams to define requirements and implement clean code architecture.",
                "Participate in code reviews, automated unit testing, and continuous integration workflows."
        );

        return JobDescriptionDto.builder()
                .title(title)
                .company(company != null ? company : "Tech Company")
                .location(location != null ? location : "Remote / Hybrid")
                .rawText(rawText)
                .active(true)
                .requiredSkills(requiredSkills)
                .preferredSkills(preferredSkills)
                .programmingLanguages(progLangs)
                .frameworks(frameworks)
                .databases(databases)
                .toolsAndCloud(toolsCloud)
                .softSkills(softSkills)
                .experienceRequirement(exp)
                .educationRequirement(edu)
                .responsibilities(responsibilities)
                .build();
    }

    private JobDescriptionDto mapToDto(JobDescription jd) {
        JobDescriptionDto dto;
        if (jd.getExtractedJson() != null && !jd.getExtractedJson().isBlank()) {
            try {
                dto = objectMapper.readValue(jd.getExtractedJson(), JobDescriptionDto.class);
            } catch (Exception e) {
                dto = parseAndExtractJd(jd.getTitle(), jd.getCompany(), jd.getLocation(), jd.getRawText());
            }
        } else {
            dto = parseAndExtractJd(jd.getTitle(), jd.getCompany(), jd.getLocation(), jd.getRawText());
        }

        dto.setId(jd.getId());
        dto.setTitle(jd.getTitle());
        dto.setCompany(jd.getCompany());
        dto.setLocation(jd.getLocation());
        dto.setRawText(jd.getRawText());
        dto.setActive(jd.isActive());
        dto.setCreatedAt(jd.getCreatedAt());
        return dto;
    }
}
