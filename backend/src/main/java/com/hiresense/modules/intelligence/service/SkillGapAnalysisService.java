package com.hiresense.modules.intelligence.service;

import com.hiresense.common.exception.ResourceNotFoundException;
import com.hiresense.modules.assessment.model.TopicPerformanceAnalytics;
import com.hiresense.modules.assessment.repository.TopicPerformanceAnalyticsRepository;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.profile.model.CompanySkillBenchmark;
import com.hiresense.modules.profile.model.StudentProfile;
import com.hiresense.modules.profile.model.TargetCompany;
import com.hiresense.modules.profile.repository.StudentProfileRepository;
import com.hiresense.modules.profile.repository.TargetCompanyRepository;
import com.hiresense.modules.intelligence.dto.CompanyReadinessDto;
import com.hiresense.modules.intelligence.dto.SkillGapDto;
import com.hiresense.modules.intelligence.model.SkillGapAssessment;
import com.hiresense.modules.intelligence.model.SkillStatus;
import com.hiresense.modules.intelligence.repository.SkillGapAssessmentRepository;
import com.hiresense.modules.interview.model.InterviewQuestion;
import com.hiresense.modules.interview.model.InterviewTurnEvaluation;
import com.hiresense.modules.interview.repository.InterviewQuestionRepository;
import com.hiresense.modules.interview.repository.InterviewTurnEvaluationRepository;
import com.hiresense.modules.resume.model.ExtractedResumeSkill;
import com.hiresense.modules.resume.model.ResumeAnalysis;
import com.hiresense.modules.resume.repository.ExtractedResumeSkillRepository;
import com.hiresense.modules.resume.repository.ResumeAnalysisRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiresense.modules.resume.dto.ResumeAnalysisResultDto;

@Slf4j
@Service
@RequiredArgsConstructor
public class SkillGapAnalysisService {

    private final UserRepository userRepository;
    private final StudentProfileRepository profileRepository;
    private final TargetCompanyRepository companyRepository;
    private final TopicPerformanceAnalyticsRepository topicAnalyticsRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final ExtractedResumeSkillRepository extractedSkillRepository;
    private final InterviewTurnEvaluationRepository turnEvaluationRepository;
    private final InterviewQuestionRepository interviewQuestionRepository;
    private final SkillGapAssessmentRepository skillGapRepository;
    private final com.hiresense.modules.ai.AIService aiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public List<SkillGapDto> evaluateAndPersistSkillGaps(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Optional<StudentProfile> profileOpt = profileRepository.findByUserId(userId);
        TargetCompany company = profileOpt.map(StudentProfile::getTargetCompany).orElse(null);

        // 1. Fetch Company Benchmarks (ONLY if configured on student profile)
        Map<String, Integer> requiredBenchmarks = new HashMap<>();
        Set<String> companyBenchmarkSkills = new HashSet<>();
        if (company != null && company.getBenchmarks() != null && !company.getBenchmarks().isEmpty()) {
            List<CompanySkillBenchmark> benchmarks = company.getBenchmarks();
            for (CompanySkillBenchmark b : benchmarks) {
                int minProf = b.getMinimumProficiency() != null ? b.getMinimumProficiency().intValue() : 70;
                requiredBenchmarks.put(b.getSkillName().toLowerCase(), minProf);
                companyBenchmarkSkills.add(b.getSkillName());
            }
        }

        // 2. Fetch User Evidence Sources
        // Resume Skills & JD Matches/Gaps
        Set<String> resumeSkills = new HashSet<>();
        Set<String> jdMatchingSkills = new HashSet<>();
        Set<String> jdMissingSkills = new HashSet<>();
        Set<String> jdRequiredSkills = new HashSet<>();
        Set<String> extractedSkillNames = new LinkedHashSet<>();

        List<ResumeAnalysis> resumeAnalyses = resumeAnalysisRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (!resumeAnalyses.isEmpty()) {
            ResumeAnalysis latestAnalysis = resumeAnalyses.get(0);
            List<ExtractedResumeSkill> extracted = extractedSkillRepository.findByResumeAnalysisId(latestAnalysis.getId());
            for (ExtractedResumeSkill s : extracted) {
                resumeSkills.add(s.getSkillName().toLowerCase());
                extractedSkillNames.add(s.getSkillName());
            }

            if (latestAnalysis.getStructuredAnalysisJson() != null) {
                try {
                    ResumeAnalysisResultDto dto = objectMapper.readValue(latestAnalysis.getStructuredAnalysisJson(), ResumeAnalysisResultDto.class);
                    if (dto.getJdMatchingSkills() != null) {
                        dto.getJdMatchingSkills().forEach(s -> {
                            jdMatchingSkills.add(s.toLowerCase());
                            extractedSkillNames.add(capitalizeWord(s));
                        });
                        resumeSkills.addAll(jdMatchingSkills);
                    }
                    if (dto.getJdMissingSkills() != null) {
                        dto.getJdMissingSkills().forEach(s -> {
                            jdMissingSkills.add(s.toLowerCase());
                            extractedSkillNames.add(capitalizeWord(s));
                        });
                    }
                    if (dto.getJdRequiredSkills() != null) {
                        dto.getJdRequiredSkills().forEach(s -> {
                            jdRequiredSkills.add(s.toLowerCase());
                            extractedSkillNames.add(capitalizeWord(s));
                        });
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse ResumeAnalysisResultDto for JD skills: {}", e.getMessage());
                }
            }
        }

        // Assessment Topic Accuracies
        Map<String, Integer> assessmentScores = new HashMap<>();
        Set<String> assessmentTopics = new LinkedHashSet<>();
        List<TopicPerformanceAnalytics> topicList = topicAnalyticsRepository.findByUserId(userId);
        for (TopicPerformanceAnalytics t : topicList) {
            if (t.getTopic() != null && t.getScorePercentage() != null) {
                assessmentScores.put(t.getTopic().toLowerCase(), t.getScorePercentage().intValue());
                assessmentTopics.add(t.getTopic());
            }
        }

        // Interview Turn Scores
        Map<String, Integer> interviewScores = new HashMap<>();
        Set<String> interviewTopics = new LinkedHashSet<>();
        List<InterviewTurnEvaluation> evals = turnEvaluationRepository.findAll().stream()
                .filter(e -> e.getInterview().getUser().getId().equals(userId))
                .toList();

        for (InterviewTurnEvaluation e : evals) {
            String topic = e.getQuestion().getTopic().toLowerCase();
            interviewScores.put(topic, e.getOverallTurnScore());
            interviewTopics.add(e.getQuestion().getTopic());
        }

        // 3. Compile Master Skill Set STRICTLY from user evidence
        Set<String> allSkillNames = new LinkedHashSet<>();
        allSkillNames.addAll(extractedSkillNames);
        allSkillNames.addAll(assessmentTopics);
        allSkillNames.addAll(interviewTopics);
        allSkillNames.addAll(companyBenchmarkSkills);

        List<SkillGapAssessment> existingList = skillGapRepository.findByUserIdOrderByGapScoreDesc(userId);
        Map<String, SkillGapAssessment> existingBySkillLower = new HashMap<>();
        for (SkillGapAssessment a : existingList) {
            existingBySkillLower.put(a.getSkillName().toLowerCase().trim(), a);
        }

        // If user has NO evidence at all, clear old stale records and return empty
        if (allSkillNames.isEmpty()) {
            if (!existingList.isEmpty()) {
                skillGapRepository.deleteAll(existingList);
            }
            return Collections.emptyList();
        }

        Set<String> processedKeys = new HashSet<>();
        List<SkillGapAssessment> toSave = new ArrayList<>();
        List<SkillGapDto> resultDtos = new ArrayList<>();

        for (String rawSkillName : allSkillNames) {
            if (rawSkillName == null || rawSkillName.isBlank()) continue;
            String key = rawSkillName.toLowerCase().trim();
            if (processedKeys.contains(key)) continue;
            processedKeys.add(key);

            String skillName = capitalizeWord(rawSkillName.trim());
            List<String> evidence = new ArrayList<>();

            int totalScore = 0;
            int count = 0;

            if (assessmentScores.containsKey(key)) {
                totalScore += assessmentScores.get(key);
                count++;
                evidence.add("ASSESSMENT");
            }
            if (interviewScores.containsKey(key)) {
                totalScore += interviewScores.get(key);
                count++;
                evidence.add("INTERVIEW");
            }
            if (jdMatchingSkills.contains(key)) {
                totalScore += 85;
                count++;
                evidence.add("JD_MATCH");
            } else if (resumeSkills.contains(key)) {
                totalScore += 75;
                count++;
                evidence.add("RESUME");
            }

            int observed = count > 0 ? (totalScore / count) : 0;
            int required = requiredBenchmarks.getOrDefault(key, jdMissingSkills.contains(key) ? 80 : 70);
            int gap = Math.max(0, required - observed);

            SkillStatus status;
            if (jdMissingSkills.contains(key)) {
                status = SkillStatus.NEEDS_IMPROVEMENT;
                if (!evidence.contains("JD_DEFICIT")) {
                    evidence.add("JD_DEFICIT");
                }
            } else if (evidence.isEmpty()) {
                status = SkillStatus.MISSING;
            } else if (observed >= 75) {
                status = SkillStatus.STRONG;
            } else if (observed >= 55) {
                status = SkillStatus.MODERATE;
            } else {
                status = SkillStatus.NEEDS_IMPROVEMENT;
            }

            String priority = gap >= 20 ? "HIGH" : (gap >= 10 ? "MEDIUM" : "LOW");
            String evidenceStr = evidence.isEmpty() ? "NOT_DEMONSTRATED" : String.join(",", evidence);

            SkillGapAssessment assessment = existingBySkillLower.get(key);
            if (assessment == null) {
                assessment = SkillGapAssessment.builder()
                        .user(user)
                        .skillName(skillName)
                        .category(determineCategory(skillName))
                        .build();
            }

            assessment.setSkillName(skillName);
            assessment.setCategory(determineCategory(skillName));
            assessment.setObservedProficiency(observed);
            assessment.setRequiredProficiency(required);
            assessment.setGapScore(gap);
            assessment.setStatus(status);
            assessment.setEvidenceSources(evidenceStr);
            assessment.setLastEvaluatedAt(Instant.now());

            toSave.add(assessment);

            String matchStatus;
            if (evidence.isEmpty()) {
                matchStatus = "NOT_DEMONSTRATED";
            } else if (observed >= required) {
                matchStatus = "STRONG_MATCH";
            } else if (observed >= 55) {
                matchStatus = "PARTIAL_MATCH";
            } else {
                matchStatus = "WEAK_MATCH";
            }

            boolean isKeywordGap = jdMissingSkills.contains(key) || !resumeSkills.contains(key);
            boolean isActualGap = observed < required;

            resultDtos.add(SkillGapDto.builder()
                    .skillName(skillName)
                    .category(assessment.getCategory())
                    .status(status)
                    .matchStatus(matchStatus)
                    .observedProficiency(observed)
                    .requiredProficiency(required)
                    .gapScore(gap)
                    .evidenceSources(evidence.isEmpty() ? List.of("Not Demonstrated") : evidence)
                    .priority(priority)
                    .isResumeKeywordGap(isKeywordGap)
                    .isActualSkillGap(isActualGap)
                    .evidenceSummary(evidence.isEmpty() ? "No verified evidence found" : String.join(" • ", evidence))
                    .build());
        }

        // Delete any existing assessments that are no longer in allSkillNames
        List<SkillGapAssessment> toDelete = existingList.stream()
                .filter(a -> !processedKeys.contains(a.getSkillName().toLowerCase().trim()))
                .collect(Collectors.toList());
        if (!toDelete.isEmpty()) {
            skillGapRepository.deleteAll(toDelete);
        }

        skillGapRepository.saveAll(toSave);

        // Sort by Gap Score descending
        resultDtos.sort((a, b) -> Integer.compare(b.getGapScore(), a.getGapScore()));
        return resultDtos;
    }

    private String capitalizeWord(String str) {
        if (str == null || str.isBlank()) return str;
        return Character.toUpperCase(str.charAt(0)) + (str.length() > 1 ? str.substring(1) : "");
    }

    @Transactional
    public List<SkillGapDto> getSkillGaps(Long userId) {
        List<SkillGapAssessment> existing = skillGapRepository.findByUserIdOrderByGapScoreDesc(userId);
        if (existing.isEmpty()) {
            return evaluateAndPersistSkillGaps(userId);
        }

        return existing.stream().map(s -> {
            boolean isActual = s.getGapScore() > 0;
            String matchStatus;
            if (s.getEvidenceSources() == null || s.getEvidenceSources().isBlank() || "NOT_DEMONSTRATED".equalsIgnoreCase(s.getEvidenceSources())) {
                matchStatus = "NOT_DEMONSTRATED";
            } else if (s.getObservedProficiency() >= s.getRequiredProficiency()) {
                matchStatus = "STRONG_MATCH";
            } else if (s.getObservedProficiency() >= 55) {
                matchStatus = "PARTIAL_MATCH";
            } else {
                matchStatus = "WEAK_MATCH";
            }

            return SkillGapDto.builder()
                    .skillName(s.getSkillName())
                    .category(s.getCategory())
                    .status(s.getStatus())
                    .matchStatus(matchStatus)
                    .observedProficiency(s.getObservedProficiency())
                    .requiredProficiency(s.getRequiredProficiency())
                    .gapScore(s.getGapScore())
                    .evidenceSources(Arrays.asList(s.getEvidenceSources().split(",")))
                    .priority(s.getGapScore() >= 20 ? "HIGH" : (s.getGapScore() >= 10 ? "MEDIUM" : "LOW"))
                    .isResumeKeywordGap(!s.getEvidenceSources().contains("RESUME") && !s.getEvidenceSources().contains("JD_MATCH"))
                    .isActualSkillGap(isActual)
                    .evidenceSummary(s.getEvidenceSources().replace(",", " • "))
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompanyReadinessDto getCompanySkillGaps(Long userId, Long companyId) {
        TargetCompany company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + companyId));

        List<SkillGapDto> allGaps = getSkillGaps(userId);

        List<SkillGapDto> strong = allGaps.stream().filter(g -> g.getStatus() == SkillStatus.STRONG).toList();
        List<SkillGapDto> moderate = allGaps.stream().filter(g -> g.getStatus() == SkillStatus.MODERATE).toList();
        List<SkillGapDto> gapSkills = allGaps.stream().filter(g -> g.getStatus() == SkillStatus.NEEDS_IMPROVEMENT).toList();
        List<SkillGapDto> missing = allGaps.stream().filter(g -> g.getStatus() == SkillStatus.MISSING).toList();

        int avgObserved = allGaps.isEmpty() ? 50 : (int) allGaps.stream().mapToInt(SkillGapDto::getObservedProficiency).average().orElse(50);

        return CompanyReadinessDto.builder()
                .companyId(company.getId())
                .companyName(company.getName())
                .companyTier(company.getTier() != null ? company.getTier().name() : "TIER_1")
                .overallReadinessScore(Math.min(98, Math.max(25, avgObserved)))
                .benchmarkVersion("BENCH_v1.0.0")
                .strongSkills(strong)
                .moderateSkills(moderate)
                .gapSkills(gapSkills)
                .missingSkills(missing)
                .build();
    }

    private String determineCategory(String skill) {
        String lower = skill.toLowerCase();
        if (lower.contains("aptitude") || lower.contains("logical") || lower.contains("verbal") || lower.contains("quantitative")) {
            return "APTITUDE";
        }
        if (lower.contains("oop") || lower.contains("dbms") || lower.contains("os") || lower.contains("network") || lower.contains("operating")) {
            return "CORE_CS";
        }
        return "TECHNICAL";
    }

    public com.hiresense.modules.intelligence.dto.JdSkillGapAnalysisResponse analyzeJdSkillGaps(
            Long userId,
            com.hiresense.modules.intelligence.dto.JdSkillGapAnalysisRequest request
    ) {
        String candidateSkills = request.getKnownSkills();

        // If candidateSkills not provided, enrich from user's verified evidence
        if ((candidateSkills == null || candidateSkills.isBlank()) && userId != null) {
            List<String> userSkills = getStudentKnownSkills(userId);
            if (!userSkills.isEmpty()) {
                candidateSkills = String.join(", ", userSkills);
            }
        }

        return aiService.analyzeJdSkillGaps(
                candidateSkills,
                request.getJobDescriptionText(),
                request.getTargetRole(),
                request.getTargetCompany()
        );
    }

    @Transactional(readOnly = true)
    public List<String> getStudentKnownSkills(Long userId) {
        if (userId == null) return Collections.emptyList();
        Set<String> skills = new LinkedHashSet<>();

        // 1. Resume extracted skills
        List<ResumeAnalysis> resumeAnalyses = resumeAnalysisRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (!resumeAnalyses.isEmpty()) {
            List<ExtractedResumeSkill> extracted = extractedSkillRepository.findByResumeAnalysisId(resumeAnalyses.get(0).getId());
            for (ExtractedResumeSkill s : extracted) {
                if (s.getSkillName() != null && !s.getSkillName().isBlank()) {
                    skills.add(s.getSkillName().trim());
                }
            }
        }

        // 2. Assessment verified topics (score >= 50%)
        List<TopicPerformanceAnalytics> topicList = topicAnalyticsRepository.findByUserId(userId);
        for (TopicPerformanceAnalytics t : topicList) {
            if (t.getTopic() != null && t.getScorePercentage() != null && t.getScorePercentage().doubleValue() >= 50.0) {
                skills.add(t.getTopic().trim());
            }
        }

        return new ArrayList<>(skills);
    }
}
