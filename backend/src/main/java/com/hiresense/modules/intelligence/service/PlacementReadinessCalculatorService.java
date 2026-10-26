package com.hiresense.modules.intelligence.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiresense.common.exception.ResourceNotFoundException;
import com.hiresense.modules.assessment.model.AssessmentResult;
import com.hiresense.modules.assessment.model.TopicPerformanceAnalytics;
import com.hiresense.modules.assessment.repository.AssessmentResultRepository;
import com.hiresense.modules.assessment.repository.TopicPerformanceAnalyticsRepository;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.profile.model.CompanySkillBenchmark;
import com.hiresense.modules.profile.model.StudentProfile;
import com.hiresense.modules.profile.model.TargetCompany;
import com.hiresense.modules.profile.repository.StudentProfileRepository;
import com.hiresense.modules.profile.repository.TargetCompanyRepository;
import com.hiresense.modules.intelligence.dto.PlacementReadinessDto;
import com.hiresense.modules.intelligence.model.PlacementReadinessSnapshot;
import com.hiresense.modules.intelligence.model.ReadinessBand;
import com.hiresense.modules.intelligence.repository.PlacementReadinessSnapshotRepository;
import com.hiresense.modules.interview.model.InterviewFinalReport;
import com.hiresense.modules.interview.repository.InterviewFinalReportRepository;
import com.hiresense.modules.resume.model.ResumeAnalysis;
import com.hiresense.modules.resume.repository.ResumeAnalysisRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlacementReadinessCalculatorService {

    public static final String SCORING_VERSION = "PRS_v1.0.0";

    // Initial proposed base framework weights (total = 1.00)
    private static final double WEIGHT_CODING = 0.25;
    private static final double WEIGHT_TECHNICAL = 0.20;
    private static final double WEIGHT_APTITUDE = 0.15;
    private static final double WEIGHT_RESUME = 0.15;
    private static final double WEIGHT_INTERVIEW = 0.15;
    private static final double WEIGHT_COMMUNICATION = 0.10;

    private final UserRepository userRepository;
    private final StudentProfileRepository profileRepository;
    private final AssessmentResultRepository assessmentResultRepository;
    private final TopicPerformanceAnalyticsRepository topicAnalyticsRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final InterviewFinalReportRepository interviewReportRepository;
    private final TargetCompanyRepository companyRepository;
    private final PlacementReadinessSnapshotRepository snapshotRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public PlacementReadinessDto calculateAndPersistReadiness(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Optional<StudentProfile> profileOpt = profileRepository.findByUserId(userId);
        String targetRole = profileOpt.map(StudentProfile::getTargetRole).orElse("Software Engineer");
        TargetCompany targetCompany = profileOpt.map(StudentProfile::getTargetCompany).orElse(null);
        String targetCompanyName = targetCompany != null ? targetCompany.getName() : "General Industry";

        // 1. Gather Available Evidence Components
        // Aptitude & Technical MCQs from Assessment Results
        List<AssessmentResult> assessmentResults = assessmentResultRepository.findByUserIdOrderByCompletedAtDesc(userId);
        Integer aptitudeScore = calculateAptitudeScore(assessmentResults);
        Integer technicalScore = calculateTechnicalScore(userId, assessmentResults);

        // Resume Score
        List<ResumeAnalysis> resumeAnalyses = resumeAnalysisRepository.findByUserIdOrderByCreatedAtDesc(userId);
        Integer resumeScore = resumeAnalyses.isEmpty() ? null : resumeAnalyses.get(0).getOverallScore();

        // Interview & Communication Scores
        List<InterviewFinalReport> interviewReports = interviewReportRepository.findByUserIdOrderByCompletedAtDesc(userId);
        Integer interviewScore = interviewReports.isEmpty() ? null : interviewReports.get(0).getOverallScore();
        Integer communicationScore = interviewReports.isEmpty() ? null : interviewReports.get(0).getCommunicationScore();

        // Coding Score (Currently null / unavailable until isolated sandbox engine is attached)
        Integer codingScore = null;

        // 2. Dynamic Weight Normalization for Available Components
        Map<String, Double> dynamicWeights = new LinkedHashMap<>();
        double availableWeightSum = 0.0;

        if (codingScore != null) { dynamicWeights.put("Coding", WEIGHT_CODING); availableWeightSum += WEIGHT_CODING; }
        if (technicalScore != null) { dynamicWeights.put("Technical", WEIGHT_TECHNICAL); availableWeightSum += WEIGHT_TECHNICAL; }
        if (aptitudeScore != null) { dynamicWeights.put("Aptitude", WEIGHT_APTITUDE); availableWeightSum += WEIGHT_APTITUDE; }
        if (resumeScore != null) { dynamicWeights.put("Resume", WEIGHT_RESUME); availableWeightSum += WEIGHT_RESUME; }
        if (interviewScore != null) { dynamicWeights.put("Interview", WEIGHT_INTERVIEW); availableWeightSum += WEIGHT_INTERVIEW; }
        if (communicationScore != null) { dynamicWeights.put("Communication", WEIGHT_COMMUNICATION); availableWeightSum += WEIGHT_COMMUNICATION; }

        int prsScore = 0;
        if (availableWeightSum > 0) {
            double weightedTotal = 0.0;
            for (Map.Entry<String, Double> entry : dynamicWeights.entrySet()) {
                double normalizedWeight = entry.getValue() / availableWeightSum;
                int score = getComponentValue(entry.getKey(), codingScore, technicalScore, aptitudeScore, resumeScore, interviewScore, communicationScore);
                weightedTotal += (score * normalizedWeight);
            }
            prsScore = (int) Math.round(weightedTotal);
        }

        // 3. Compute Assessment Confidence Score (0 - 100%)
        int confidenceScore = calculateConfidenceScore(
                dynamicWeights.size(),
                assessmentResults.size(),
                resumeAnalyses.size(),
                interviewReports.size(),
                profileOpt.isPresent()
        );

        // 4. Company-Specific Readiness Score
        Integer companyReadiness = null;
        if (targetCompany != null) {
            companyReadiness = calculateCompanyReadiness(targetCompany, technicalScore, aptitudeScore, resumeScore);
        }

        ReadinessBand band = ReadinessBand.fromScore(prsScore);

        // 5. Generate Deterministic Explanation Summary
        Map<String, Integer> availableScores = new LinkedHashMap<>();
        if (codingScore != null) availableScores.put("Coding", codingScore);
        if (technicalScore != null) availableScores.put("Technical Core", technicalScore);
        if (aptitudeScore != null) availableScores.put("General Aptitude", aptitudeScore);
        if (resumeScore != null) availableScores.put("Resume Readiness", resumeScore);
        if (interviewScore != null) availableScores.put("Mock Interview", interviewScore);
        if (communicationScore != null) availableScores.put("Communication Quality", communicationScore);

        String strongestArea = "General Foundations";
        String biggestOpportunity = "Diagnostic Assessment Completion";
        if (!availableScores.isEmpty()) {
            strongestArea = Collections.max(availableScores.entrySet(), Map.Entry.comparingByValue()).getKey();
            biggestOpportunity = Collections.min(availableScores.entrySet(), Map.Entry.comparingByValue()).getKey();
        }

        String explanation = generateExplanation(prsScore, confidenceScore, band, strongestArea, biggestOpportunity, dynamicWeights.size());

        List<String> recommendations = generateRecommendations(biggestOpportunity, availableScores, profileOpt.isPresent());

        // 6. Persist Immutable Snapshot
        Map<String, Object> breakdownJsonMap = Map.of(
                "prsScore", prsScore,
                "confidenceScore", confidenceScore,
                "dynamicWeights", dynamicWeights,
                "codingScore", codingScore != null ? codingScore : "N/A",
                "technicalScore", technicalScore != null ? technicalScore : "N/A",
                "aptitudeScore", aptitudeScore != null ? aptitudeScore : "N/A",
                "resumeScore", resumeScore != null ? resumeScore : "N/A",
                "interviewScore", interviewScore != null ? interviewScore : "N/A",
                "communicationScore", communicationScore != null ? communicationScore : "N/A"
        );

        String jsonString;
        try {
            jsonString = objectMapper.writeValueAsString(breakdownJsonMap);
        } catch (Exception e) {
            jsonString = "{}";
        }

        PlacementReadinessSnapshot snapshot = PlacementReadinessSnapshot.builder()
                .user(user)
                .prsScore(prsScore)
                .confidenceScore(confidenceScore)
                .readinessBand(band)
                .scoringVersion(SCORING_VERSION)
                .targetRole(targetRole)
                .targetCompany(targetCompanyName)
                .companyReadinessScore(companyReadiness)
                .codingScore(codingScore)
                .technicalScore(technicalScore)
                .aptitudeScore(aptitudeScore)
                .resumeScore(resumeScore)
                .interviewScore(interviewScore)
                .communicationScore(communicationScore)
                .componentBreakdownJson(jsonString)
                .explanationSummary(explanation)
                .createdAt(Instant.now())
                .build();

        snapshotRepository.save(snapshot);

        return PlacementReadinessDto.builder()
                .prsScore(prsScore)
                .confidenceScore(confidenceScore)
                .readinessBand(band)
                .scoringVersion(SCORING_VERSION)
                .targetRole(targetRole)
                .targetCompany(targetCompanyName)
                .companyReadinessScore(companyReadiness)
                .codingScore(codingScore)
                .technicalScore(technicalScore)
                .aptitudeScore(aptitudeScore)
                .resumeScore(resumeScore)
                .interviewScore(interviewScore)
                .communicationScore(communicationScore)
                .componentWeights(dynamicWeights)
                .availableEvidenceCount(dynamicWeights.size())
                .explanationSummary(explanation)
                .strongestArea(strongestArea)
                .biggestOpportunity(biggestOpportunity)
                .recommendations(recommendations)
                .calculatedAt(snapshot.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public PlacementReadinessDto getLatestReadiness(Long userId) {
        Optional<PlacementReadinessSnapshot> latestOpt = snapshotRepository.findFirstByUserIdOrderByCreatedAtDesc(userId);
        if (latestOpt.isPresent()) {
            return mapToDto(latestOpt.get());
        }
        // If never computed, compute now
        return calculateAndPersistReadiness(userId);
    }

    @Transactional(readOnly = true)
    public List<PlacementReadinessDto> getReadinessHistory(Long userId) {
        return snapshotRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDto)
                .toList();
    }

    // Helper: Calculate Aptitude Score from Quants, Logical, Verbal with Temporal Decay
    private Integer calculateAptitudeScore(List<AssessmentResult> results) {
        if (results.isEmpty()) return null;

        double weightedSum = 0.0;
        double weightTotal = 0.0;

        for (AssessmentResult res : results) {
            double recencyWeight = getRecencyWeight(res.getCompletedAt());
            double score = res.getScorePercentage() != null ? res.getScorePercentage().doubleValue() : 0.0;
            weightedSum += (score * recencyWeight);
            weightTotal += recencyWeight;
        }

        return weightTotal > 0 ? (int) Math.round(weightedSum / weightTotal) : null;
    }

    // Helper: Calculate Technical Score from Core CS MCQs + Technical Interview turns
    private Integer calculateTechnicalScore(Long userId, List<AssessmentResult> results) {
        List<TopicPerformanceAnalytics> topicList = topicAnalyticsRepository.findByUserId(userId);
        if (topicList.isEmpty() && results.isEmpty()) return null;

        double sum = 0.0;
        int count = 0;

        for (TopicPerformanceAnalytics t : topicList) {
            if ("CORE_CS".equalsIgnoreCase(t.getCategory()) || "TECHNICAL".equalsIgnoreCase(t.getCategory())) {
                double score = t.getScorePercentage() != null ? t.getScorePercentage().doubleValue() : 0.0;
                sum += score;
                count++;
            }
        }

        if (count == 0 && !results.isEmpty()) {
            return results.get(0).getScorePercentage() != null ? results.get(0).getScorePercentage().intValue() : null;
        }

        return count > 0 ? (int) Math.round(sum / count) : null;
    }

    // Helper: Calculate Assessment Confidence Score
    private int calculateConfidenceScore(int availableDimensions, int assessmentCount, int resumeCount, int interviewCount, boolean profileComplete) {
        if (availableDimensions == 0 && assessmentCount == 0 && resumeCount == 0 && interviewCount == 0 && !profileComplete) {
            return 0;
        }
        // Component coverage (up to 50 points)
        int coveragePoints = (int) Math.round((availableDimensions / 6.0) * 50.0);

        // Assessment depth (up to 25 points)
        int assessmentPoints = Math.min(25, assessmentCount * 8);

        // Resume & Interview presence (up to 15 points)
        int artifactPoints = (resumeCount > 0 ? 8 : 0) + (interviewCount > 0 ? 7 : 0);

        // Profile completeness (up to 10 points)
        int profilePoints = profileComplete ? 10 : 0;

        int total = coveragePoints + assessmentPoints + artifactPoints + profilePoints;
        return Math.min(100, total);
    }

    // Helper: Calculate Company Specific Readiness against benchmarks
    private int calculateCompanyReadiness(TargetCompany company, Integer techScore, Integer aptScore, Integer resumeScore) {
        List<CompanySkillBenchmark> benchmarks = company.getBenchmarks();
        if (benchmarks == null || benchmarks.isEmpty()) {
            int base = (techScore != null ? techScore : 60) + (aptScore != null ? aptScore : 60) + (resumeScore != null ? resumeScore : 60);
            return base / 3;
        }

        double totalGap = 0.0;
        for (CompanySkillBenchmark b : benchmarks) {
            int minProf = b.getMinimumProficiency() != null ? b.getMinimumProficiency().intValue() : 70;
            int observed = "QUANTITATIVE".equalsIgnoreCase(b.getCategory().name()) || "LOGICAL".equalsIgnoreCase(b.getCategory().name())
                    ? (aptScore != null ? aptScore : 50)
                    : (techScore != null ? techScore : 50);
            int gap = Math.max(0, minProf - observed);
            totalGap += gap;
        }

        int avgGap = (int) Math.round(totalGap / benchmarks.size());
        return Math.max(20, Math.min(98, 100 - avgGap));
    }

    // Helper: Temporal Recency Exponential Decay
    private double getRecencyWeight(Instant completedAt) {
        if (completedAt == null) return 0.8;
        long daysOld = Duration.between(completedAt, Instant.now()).toDays();
        if (daysOld <= 30) return 1.0;
        if (daysOld <= 60) return 0.85;
        if (daysOld <= 90) return 0.70;
        return 0.55; // Older than 90 days
    }

    private int getComponentValue(String name, Integer coding, Integer tech, Integer apt, Integer res, Integer interview, Integer comm) {
        return switch (name) {
            case "Coding" -> coding != null ? coding : 0;
            case "Technical" -> tech != null ? tech : 0;
            case "Aptitude" -> apt != null ? apt : 0;
            case "Resume" -> res != null ? res : 0;
            case "Interview" -> interview != null ? interview : 0;
            case "Communication" -> comm != null ? comm : 0;
            default -> 0;
        };
    }

    private String generateExplanation(int prs, int confidence, ReadinessBand band, String strongest, String weakest, int dimensionCount) {
        String base = String.format(
                "Placement Readiness Score is %d/100 (%s) with %d%% assessment confidence based on %d active diagnostic dimension(s). ",
                prs, band.getDisplayName(), confidence, dimensionCount
        );
        if (dimensionCount < 3) {
            base += "Note: Your readiness index is based on limited diagnostic evidence. Complete additional mock assessments and interview sessions to improve confidence. ";
        }
        base += String.format("Demonstrated strongest competency in %s. Prime opportunity for targeted improvement is in %s.", strongest, weakest);
        return base;
    }

    private List<String> generateRecommendations(String weakest, Map<String, Integer> scores, boolean profileComplete) {
        List<String> list = new ArrayList<>();
        if (!profileComplete) {
            list.add("Complete your academic profile and set target company benchmarks to initialize adaptive readiness tracking.");
        }
        list.add("Focus scheduled preparation on " + weakest + " to eliminate immediate benchmark gaps.");
        list.add("Take a timed diagnostic MCQ assessment to update temporal accuracy weights.");
        list.add("Launch a targeted technical AI mock interview to practice structured verbal problem solving.");
        return list;
    }

    private PlacementReadinessDto mapToDto(PlacementReadinessSnapshot s) {
        return PlacementReadinessDto.builder()
                .prsScore(s.getPrsScore())
                .confidenceScore(s.getConfidenceScore())
                .readinessBand(s.getReadinessBand())
                .scoringVersion(s.getScoringVersion())
                .targetRole(s.getTargetRole())
                .targetCompany(s.getTargetCompany())
                .companyReadinessScore(s.getCompanyReadinessScore())
                .codingScore(s.getCodingScore())
                .technicalScore(s.getTechnicalScore())
                .aptitudeScore(s.getAptitudeScore())
                .resumeScore(s.getResumeScore())
                .interviewScore(s.getInterviewScore())
                .communicationScore(s.getCommunicationScore())
                .explanationSummary(s.getExplanationSummary())
                .calculatedAt(s.getCreatedAt())
                .build();
    }
}
