package com.hiresense.modules.resume.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiresense.common.exception.BadRequestException;
import com.hiresense.common.exception.ResourceNotFoundException;
import com.hiresense.modules.ai.AIService;
import com.hiresense.modules.ai.ResumeAnalysisPromptTemplate;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.intelligence.service.PlacementReadinessCalculatorService;
import com.hiresense.modules.intelligence.service.SkillGapAnalysisService;
import com.hiresense.modules.profile.model.StudentProfile;
import com.hiresense.modules.profile.repository.StudentProfileRepository;
import com.hiresense.modules.resume.dto.*;
import com.hiresense.modules.resume.model.*;
import com.hiresense.modules.resume.repository.*;
import com.hiresense.modules.resume.storage.ResumeStorageService;
import com.hiresense.modules.resume.util.PiiSanitizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final ResumeAnalysisRepository analysisRepository;
    private final ExtractedResumeSkillRepository skillRepository;
    private final JobDescriptionRepository jdRepository;
    private final JdResumeAnalysisRepository jdResumeAnalysisRepository;
    private final ResumeImprovementSuggestionRepository suggestionRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository profileRepository;
    private final PdfTextExtractorService pdfExtractor;
    private final ResumeStorageService storageService;
    private final AIService aiService;
    private final SkillGapAnalysisService skillGapService;
    private final PlacementReadinessCalculatorService readinessService;
    private final JobDescriptionService jobDescriptionService;
    private final ObjectMapper objectMapper;

    @Transactional
    public ResumeDto uploadResume(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // 1. PDF Validation & Text Extraction
        PdfTextExtractorService.ExtractedPdfData pdfData = pdfExtractor.validateAndExtractText(file);

        // 2. Compute SHA-256 Hash
        String sha256Hash = calculateSha256(file);

        // 3. Mark previous resumes as inactive
        List<Resume> existingResumes = resumeRepository.findByUserIdOrderByVersionNumberDesc(userId);
        int nextVersion = existingResumes.isEmpty() ? 1 : existingResumes.get(0).getVersionNumber() + 1;

        for (Resume r : existingResumes) {
            if (r.isActive()) {
                r.setActive(false);
                resumeRepository.save(r);
            }
        }

        // 4. Generate UUID-based Storage Filename
        String storageFilename = "resume_u" + userId + "_v" + nextVersion + "_" + UUID.randomUUID() + ".pdf";

        // 5. Store File
        try {
            storageService.store(file.getInputStream(), storageFilename);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read uploaded resume file stream", e);
        }

        // 6. Persist Resume Entity
        Resume resume = Resume.builder()
                .user(user)
                .versionNumber(nextVersion)
                .originalFilename(pdfData.getOriginalFilename())
                .storageFilename(storageFilename)
                .fileSizeBytes(pdfData.getSizeBytes())
                .fileHashSha256(sha256Hash)
                .pageCount(pdfData.getPageCount())
                .rawText(pdfData.getText())
                .active(true)
                .build();

        Resume saved = resumeRepository.save(resume);
        return mapToResumeDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ResumeDto> getMyResumes(Long userId) {
        return resumeRepository.findByUserIdOrderByVersionNumberDesc(userId).stream()
                .map(this::mapToResumeDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ResumeDto getResumeById(Long resumeId, Long userId) {
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found or unauthorized"));
        return mapToResumeDto(resume);
    }

    @Transactional(readOnly = true)
    public Resource downloadResume(Long resumeId, Long userId) {
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found or unauthorized"));
        return storageService.loadAsResource(resume.getStorageFilename());
    }

    @Transactional
    public ResumeAnalysisResponse analyzeResume(Long resumeId, Long userId) {
        return analyzeResume(resumeId, userId, null);
    }

    @Transactional
    public ResumeAnalysisResponse analyzeResume(Long resumeId, Long userId, ResumeAnalysisRequest request) {
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found or unauthorized"));

        // Retrieve student profile context
        Optional<StudentProfile> profileOpt = profileRepository.findByUserId(userId);
        String targetRole = (request != null && request.getTargetRole() != null && !request.getTargetRole().trim().isEmpty())
                ? request.getTargetRole().trim()
                : profileOpt.map(StudentProfile::getTargetRole).orElse("Software Engineer");

        String targetCompany = (request != null && request.getTargetCompany() != null && !request.getTargetCompany().trim().isEmpty())
                ? request.getTargetCompany().trim()
                : profileOpt.map(p -> p.getTargetCompany() != null ? p.getTargetCompany().getName() : "Tech Industry")
                .orElse("Tech Industry");

        // Resolve Job Description if provided
        JobDescription jobDescriptionEntity = null;
        String jobDescriptionText = null;

        if (request != null) {
            if (request.getJobDescriptionId() != null) {
                jobDescriptionEntity = jdRepository.findByIdAndUserId(request.getJobDescriptionId(), userId).orElse(null);
                if (jobDescriptionEntity != null) {
                    jobDescriptionText = jobDescriptionEntity.getRawText();
                    if (jobDescriptionEntity.getTitle() != null && !jobDescriptionEntity.getTitle().isBlank()) {
                        targetRole = jobDescriptionEntity.getTitle();
                    }
                    if (jobDescriptionEntity.getCompany() != null && !jobDescriptionEntity.getCompany().isBlank()) {
                        targetCompany = jobDescriptionEntity.getCompany();
                    }
                }
            } else if (request.getJobDescription() != null && !request.getJobDescription().trim().isEmpty()) {
                jobDescriptionText = request.getJobDescription().trim();
                // Automatically save as persistent JD if new
                JobDescriptionDto savedJd = jobDescriptionService.createJobDescription(userId, JobDescriptionCreateRequest.builder()
                        .title(targetRole)
                        .company(targetCompany)
                        .rawText(jobDescriptionText)
                        .build());
                jobDescriptionEntity = jdRepository.findById(savedJd.getId()).orElse(null);
            }
        }

        boolean hasJd = jobDescriptionText != null && !jobDescriptionText.trim().isEmpty();
        String promptVersion = ResumeAnalysisPromptTemplate.PROMPT_VERSION;

        // 1. Caching Check: Only check cache for Standalone mode (no custom JD)
        if (!hasJd) {
            Optional<ResumeAnalysis> cachedOpt = analysisRepository
                    .findFirstByResumeIdAndTargetRoleAndPromptVersion(resumeId, targetRole, promptVersion);

            if (cachedOpt.isPresent()) {
                log.info("Returning cached resume analysis for Resume ID: {} (Target Role: {})", resumeId, targetRole);
                return mapToAnalysisResponse(cachedOpt.get());
            }
        }

        // 2. Privacy & PII Sanitization
        String sanitizedText = PiiSanitizer.sanitize(resume.getRawText());

        // 3. Call AI Service (with JD if present)
        ResumeAnalysisResultDto resultDto = aiService.analyzeResume(sanitizedText, targetRole, targetCompany, jobDescriptionText);

        String jsonString;
        try {
            jsonString = objectMapper.writeValueAsString(resultDto);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize AI analysis result", e);
        }

        boolean isHeuristic = "HEURISTIC".equalsIgnoreCase(aiService.getProviderName()) ||
                resultDto.getOverallScore() == null;

        // 4. Persist ResumeAnalysis
        ResumeAnalysis analysis = ResumeAnalysis.builder()
                .resume(resume)
                .user(resume.getUser())
                .targetRole(targetRole)
                .targetCompany(targetCompany)
                .aiProvider(aiService.getProviderName())
                .aiModel(aiService.getModelName())
                .promptVersion(promptVersion)
                .analysisVersion(hasJd ? "v2.0.0-jd" : "v2.0.0")
                .overallScore(resultDto.getOverallScore())
                .atsOrientedScore(resultDto.getAtsOrientedScore())
                .heuristicFallback(isHeuristic)
                .structuredAnalysisJson(jsonString)
                .build();

        ResumeAnalysis savedAnalysis = analysisRepository.save(analysis);

        // 5. Store Extracted Skills
        if (resultDto.getExtractedSkills() != null) {
            List<ExtractedResumeSkill> skillEntities = resultDto.getExtractedSkills().stream()
                    .map(skillName -> ExtractedResumeSkill.builder()
                            .resumeAnalysis(savedAnalysis)
                            .skillName(skillName)
                            .category("TECHNICAL")
                            .verifiedInResume(true)
                            .build())
                    .collect(Collectors.toList());
            skillRepository.saveAll(skillEntities);
            savedAnalysis.setExtractedSkills(skillEntities);
        }

        // 6. Persist ResumeImprovementSuggestion items for interactive student actions
        if (resultDto.getSectionReviews() != null) {
            for (ResumeSectionReviewDto review : resultDto.getSectionReviews()) {
                if (review.getSuggestedImprovement() != null && !review.getSuggestedImprovement().isBlank()) {
                    ResumeImprovementSuggestion suggestion = ResumeImprovementSuggestion.builder()
                            .resumeAnalysis(savedAnalysis)
                            .user(resume.getUser())
                            .sectionName(review.getSectionName())
                            .currentContent(review.getExtractedContent())
                            .suggestionText(review.getSuggestedImprovement())
                            .rationale(review.getIssuesFound() != null ? String.join("; ", review.getIssuesFound()) : null)
                            .status("PENDING")
                            .build();
                    ResumeImprovementSuggestion savedSug = suggestionRepository.save(suggestion);
                    review.setSuggestionId(savedSug.getId());
                    review.setSuggestionStatus(savedSug.getStatus());
                }
            }
        }

        // 7. Persist JdResumeAnalysis Snapshot Record
        int strongCount = 0;
        int partialCount = 0;
        int weakCount = 0;
        int missingCount = 0;

        if (resultDto.getSkillEvidenceDetails() != null) {
            for (SkillEvidenceDetailDto detail : resultDto.getSkillEvidenceDetails()) {
                switch (detail.getMatchStatus()) {
                    case "STRONG_MATCH" -> strongCount++;
                    case "PARTIAL_MATCH" -> partialCount++;
                    case "WEAK_MATCH" -> weakCount++;
                    case "NOT_DEMONSTRATED" -> missingCount++;
                }
            }
        }

        JdResumeAnalysis jdAnalysis = JdResumeAnalysis.builder()
                .user(resume.getUser())
                .resume(resume)
                .jobDescription(jobDescriptionEntity)
                .resumeAnalysis(savedAnalysis)
                .jdMatchScore(resultDto.getJdMatchScore() != null ? resultDto.getJdMatchScore() : resultDto.getOverallScore())
                .strongMatchesCount(strongCount)
                .partialMatchesCount(partialCount)
                .weakMatchesCount(weakCount)
                .missingMatchesCount(missingCount)
                .structuredMatchJson(jsonString)
                .build();

        jdResumeAnalysisRepository.save(jdAnalysis);

        // 8. Trigger Skill Gap and Readiness recalculations
        try {
            skillGapService.evaluateAndPersistSkillGaps(userId);
            readinessService.calculateAndPersistReadiness(userId);
        } catch (Exception e) {
            log.warn("Failed to recalculate skill gaps/readiness after resume analysis: {}", e.getMessage());
        }

        return mapToAnalysisResponse(savedAnalysis);
    }

    @Transactional(readOnly = true)
    public ResumeAnalysisResponse getLatestAnalysis(Long resumeId, Long userId) {
        resumeRepository.findByIdAndUserId(resumeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found or unauthorized"));

        ResumeAnalysis analysis = analysisRepository.findFirstByResumeIdOrderByCreatedAtDesc(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("No analysis found for this resume version"));

        return mapToAnalysisResponse(analysis);
    }

    @Transactional(readOnly = true)
    public List<ResumeAnalysisResponse> getAnalysisHistory(Long userId) {
        return analysisRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToAnalysisResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<JdResumeAnalysisResponse> getJdAnalysisHistory(Long userId) {
        return jdResumeAnalysisRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToJdAnalysisResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JdResumeAnalysisResponse getJdAnalysisById(Long analysisId, Long userId) {
        JdResumeAnalysis jdAnalysis = jdResumeAnalysisRepository.findByIdAndUserId(analysisId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Analysis snapshot not found or unauthorized"));
        return mapToJdAnalysisResponse(jdAnalysis);
    }

    @Transactional
    public ResumeImprovementSuggestion updateSuggestionStatus(Long suggestionId, Long userId, SuggestionActionRequest request) {
        ResumeImprovementSuggestion suggestion = suggestionRepository.findByIdAndUserId(suggestionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Suggestion not found or unauthorized"));

        String action = request.getAction().toUpperCase().trim();
        switch (action) {
            case "ACCEPT" -> suggestion.setStatus("ACCEPTED");
            case "REJECT" -> suggestion.setStatus("REJECTED");
            case "EDIT" -> {
                suggestion.setStatus("EDITED");
                if (request.getEditedContent() != null) {
                    suggestion.setSuggestionText(request.getEditedContent());
                }
            }
            default -> throw new BadRequestException("Invalid suggestion action: " + request.getAction());
        }

        return suggestionRepository.save(suggestion);
    }

    @Transactional(readOnly = true)
    public AnalysisComparisonDto compareAnalyses(Long analysisAId, Long analysisBId, Long userId) {
        JdResumeAnalysis a = jdResumeAnalysisRepository.findByIdAndUserId(analysisAId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("First analysis snapshot not found"));
        JdResumeAnalysis b = jdResumeAnalysisRepository.findByIdAndUserId(analysisBId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Second analysis snapshot not found"));

        ResumeAnalysis raA = a.getResumeAnalysis();
        ResumeAnalysis raB = b.getResumeAnalysis();

        int scoreA = raA.getOverallScore();
        int scoreB = raB.getOverallScore();
        int atsA = raA.getAtsOrientedScore();
        int atsB = raB.getAtsOrientedScore();
        int jdMatchA = a.getJdMatchScore();
        int jdMatchB = b.getJdMatchScore();

        int gapsA = a.getMissingMatchesCount() + a.getWeakMatchesCount();
        int gapsB = b.getMissingMatchesCount() + b.getWeakMatchesCount();

        List<String> keyImprovements = new ArrayList<>();
        if (scoreB > scoreA) keyImprovements.add(String.format("Resume Quality Score improved by +%d points (from %d to %d).", scoreB - scoreA, scoreA, scoreB));
        if (atsB > atsA) keyImprovements.add(String.format("ATS Compatibility Score improved by +%d points (from %d to %d).", atsB - atsA, atsA, atsB));
        if (jdMatchB > jdMatchA) keyImprovements.add(String.format("Job Description Match Score increased by +%d points (from %d to %d).", jdMatchB - jdMatchA, jdMatchA, jdMatchB));
        if (gapsB < gapsA) keyImprovements.add(String.format("Reduced total skill gaps by %d (from %d to %d).", gapsA - gapsB, gapsA, gapsB));

        return AnalysisComparisonDto.builder()
                .analysisAId(a.getId())
                .resumeVersionA(a.getResume().getVersionNumber())
                .jdTitleA(a.getJobDescription() != null ? a.getJobDescription().getTitle() : a.getResumeAnalysis().getTargetRole())
                .resumeScoreA(scoreA)
                .atsScoreA(atsA)
                .jdMatchScoreA(jdMatchA)
                .skillGapsCountA(gapsA)
                .createdAtA(a.getCreatedAt())
                .analysisBId(b.getId())
                .resumeVersionB(b.getResume().getVersionNumber())
                .jdTitleB(b.getJobDescription() != null ? b.getJobDescription().getTitle() : b.getResumeAnalysis().getTargetRole())
                .resumeScoreB(scoreB)
                .atsScoreB(atsB)
                .jdMatchScoreB(jdMatchB)
                .skillGapsCountB(gapsB)
                .createdAtB(b.getCreatedAt())
                .resumeScoreDelta(scoreB - scoreA)
                .atsScoreDelta(atsB - atsA)
                .jdMatchScoreDelta(jdMatchB - jdMatchA)
                .skillGapsDelta(gapsB - gapsA)
                .keyImprovements(keyImprovements)
                .build();
    }

    @Transactional
    public void deleteResume(Long resumeId, Long userId) {
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found or unauthorized"));

        storageService.delete(resume.getStorageFilename());
        resumeRepository.delete(resume);
    }

    // Mapping Helpers
    private ResumeDto mapToResumeDto(Resume resume) {
        Optional<ResumeAnalysis> analysisOpt = analysisRepository.findFirstByResumeIdOrderByCreatedAtDesc(resume.getId());

        return ResumeDto.builder()
                .id(resume.getId())
                .versionNumber(resume.getVersionNumber())
                .originalFilename(resume.getOriginalFilename())
                .fileSizeBytes(resume.getFileSizeBytes())
                .pageCount(resume.getPageCount())
                .active(resume.isActive())
                .createdAt(resume.getCreatedAt())
                .analyzed(analysisOpt.isPresent())
                .latestScore(analysisOpt.map(ResumeAnalysis::getOverallScore).orElse(null))
                .build();
    }

    private ResumeAnalysisResponse mapToAnalysisResponse(ResumeAnalysis analysis) {
        ResumeAnalysisResultDto resultDto;
        try {
            resultDto = objectMapper.readValue(analysis.getStructuredAnalysisJson(), ResumeAnalysisResultDto.class);
        } catch (Exception e) {
            log.error("Failed to parse analysis JSON for ID: {}", analysis.getId(), e);
            resultDto = ResumeAnalysisResultDto.builder()
                    .overallScore(analysis.getOverallScore())
                    .atsOrientedScore(analysis.getAtsOrientedScore())
                    .build();
        }

        // Attach populated suggestion IDs if available
        List<ResumeImprovementSuggestion> suggestions = suggestionRepository.findByResumeAnalysisIdOrderByCreatedAtAsc(analysis.getId());
        if (!suggestions.isEmpty() && resultDto.getSectionReviews() != null) {
            Map<String, ResumeImprovementSuggestion> sugMap = suggestions.stream()
                    .collect(Collectors.toMap(ResumeImprovementSuggestion::getSectionName, s -> s, (s1, s2) -> s1));
            for (ResumeSectionReviewDto review : resultDto.getSectionReviews()) {
                ResumeImprovementSuggestion s = sugMap.get(review.getSectionName());
                if (s != null) {
                    review.setSuggestionId(s.getId());
                    review.setSuggestionStatus(s.getStatus());
                }
            }
        }

        return ResumeAnalysisResponse.builder()
                .id(analysis.getId())
                .resumeId(analysis.getResume().getId())
                .versionNumber(analysis.getResume().getVersionNumber())
                .targetRole(analysis.getTargetRole())
                .targetCompany(analysis.getTargetCompany())
                .aiProvider(analysis.getAiProvider())
                .aiModel(analysis.getAiModel())
                .promptVersion(analysis.getPromptVersion())
                .analysisVersion(analysis.getAnalysisVersion())
                .overallScore(analysis.getOverallScore())
                .atsOrientedScore(analysis.getAtsOrientedScore())
                .heuristicFallback(analysis.isHeuristicFallback())
                .analysis(resultDto)
                .createdAt(analysis.getCreatedAt())
                .build();
    }

    private JdResumeAnalysisResponse mapToJdAnalysisResponse(JdResumeAnalysis jdAnalysis) {
        ResumeAnalysisResultDto resultDto = null;
        try {
            resultDto = objectMapper.readValue(jdAnalysis.getStructuredMatchJson(), ResumeAnalysisResultDto.class);
        } catch (Exception e) {
            log.warn("Failed to parse JD match JSON: {}", e.getMessage());
        }

        List<SkillEvidenceDetailDto> allSkills = resultDto != null && resultDto.getSkillEvidenceDetails() != null
                ? resultDto.getSkillEvidenceDetails() : Collections.emptyList();

        List<SkillEvidenceDetailDto> strongSkills = allSkills.stream()
                .filter(s -> "STRONG_MATCH".equalsIgnoreCase(s.getMatchStatus()))
                .collect(Collectors.toList());

        List<SkillEvidenceDetailDto> priorityGaps = allSkills.stream()
                .filter(s -> s.getGapScore() > 0)
                .sorted(Comparator.comparing(SkillEvidenceDetailDto::getGapScore).reversed())
                .collect(Collectors.toList());

        List<SkillEvidenceDetailDto> keywordGaps = allSkills.stream()
                .filter(SkillEvidenceDetailDto::isResumeKeywordGap)
                .collect(Collectors.toList());

        return JdResumeAnalysisResponse.builder()
                .id(jdAnalysis.getId())
                .userId(jdAnalysis.getUser().getId())
                .resumeId(jdAnalysis.getResume().getId())
                .resumeVersionNumber(jdAnalysis.getResume().getVersionNumber())
                .jobDescriptionId(jdAnalysis.getJobDescription() != null ? jdAnalysis.getJobDescription().getId() : null)
                .jobTitle(jdAnalysis.getJobDescription() != null ? jdAnalysis.getJobDescription().getTitle() : jdAnalysis.getResumeAnalysis().getTargetRole())
                .company(jdAnalysis.getJobDescription() != null ? jdAnalysis.getJobDescription().getCompany() : jdAnalysis.getResumeAnalysis().getTargetCompany())
                .resumeAnalysisId(jdAnalysis.getResumeAnalysis().getId())
                .resumeScore(jdAnalysis.getResumeAnalysis().getOverallScore())
                .atsScore(jdAnalysis.getResumeAnalysis().getAtsOrientedScore())
                .jdMatchScore(jdAnalysis.getJdMatchScore())
                .strongMatchesCount(jdAnalysis.getStrongMatchesCount())
                .partialMatchesCount(jdAnalysis.getPartialMatchesCount())
                .weakMatchesCount(jdAnalysis.getWeakMatchesCount())
                .missingMatchesCount(jdAnalysis.getMissingMatchesCount())
                .allSkillsAnalysis(allSkills)
                .strongSkills(strongSkills)
                .prioritySkillGaps(priorityGaps)
                .keywordGaps(keywordGaps)
                .sectionReviews(resultDto != null ? resultDto.getSectionReviews() : Collections.emptyList())
                .tailoredBulletSuggestions(resultDto != null ? resultDto.getTailoredSuggestions() : Collections.emptyList())
                .nextLearningPriorities(resultDto != null ? resultDto.getLearningPriorities() : Collections.emptyList())
                .createdAt(jdAnalysis.getCreatedAt())
                .build();
    }

    private String calculateSha256(MultipartFile file) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(file.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException | IOException e) {
            throw new RuntimeException("Could not calculate SHA-256 checksum", e);
        }
    }
}
