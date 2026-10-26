package com.hiresense.modules.intelligence.service;

import com.hiresense.modules.assessment.model.AssessmentResult;
import com.hiresense.modules.assessment.repository.AssessmentResultRepository;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.intelligence.dto.AnonymizedStudentResearchRecordDto;
import com.hiresense.modules.intelligence.dto.ResearchCohortMetricsDto;
import com.hiresense.modules.intelligence.model.PlacementReadinessSnapshot;
import com.hiresense.modules.intelligence.repository.PlacementReadinessSnapshotRepository;
import com.hiresense.modules.interview.repository.InterviewFinalReportRepository;
import com.hiresense.modules.resume.repository.ResumeAnalysisRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResearchAnalyticsService {

    private final UserRepository userRepository;
    private final PlacementReadinessSnapshotRepository snapshotRepository;
    private final AssessmentResultRepository assessmentResultRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final InterviewFinalReportRepository interviewReportRepository;

    @Transactional(readOnly = true)
    public ResearchCohortMetricsDto getCohortResearchMetrics() {
        List<User> students = userRepository.findAll().stream()
                .filter(u -> u.getRoles() != null && u.getRoles().stream().anyMatch(r -> r.getName().name().contains("STUDENT")))
                .toList();

        if (students.isEmpty()) {
            return ResearchCohortMetricsDto.builder().build();
        }

        List<Double> preScores = new ArrayList<>();
        List<Double> postScores = new ArrayList<>();
        List<Double> prsScores = new ArrayList<>();
        List<Double> confidences = new ArrayList<>();
        List<Double> normGains = new ArrayList<>();
        List<Double> absGains = new ArrayList<>();

        for (User s : students) {
            List<AssessmentResult> results = assessmentResultRepository.findByUserIdOrderByCompletedAtDesc(s.getId());
            if (results.size() >= 2) {
                double post = results.get(0).getScorePercentage() != null ? results.get(0).getScorePercentage().doubleValue() : 0.0;
                double pre = results.get(results.size() - 1).getScorePercentage() != null ? results.get(results.size() - 1).getScorePercentage().doubleValue() : 0.0;

                preScores.add(pre);
                postScores.add(post);
                absGains.add(post - pre);

                double normGain = (100.0 - pre > 0) ? ((post - pre) / (100.0 - pre)) : 0.0;
                normGains.add(Math.max(-1.0, Math.min(1.0, normGain)));
            } else if (results.size() == 1) {
                double score = results.get(0).getScorePercentage() != null ? results.get(0).getScorePercentage().doubleValue() : 0.0;
                preScores.add(score);
                postScores.add(score);
                absGains.add(0.0);
                normGains.add(0.0);
            }

            Optional<PlacementReadinessSnapshot> latestSnapshot = snapshotRepository.findFirstByUserIdOrderByCreatedAtDesc(s.getId());
            latestSnapshot.ifPresent(snap -> {
                prsScores.add((double) snap.getPrsScore());
                confidences.add((double) snap.getConfidenceScore());
            });
        }

        double avgPrs = average(prsScores);
        double avgConf = average(confidences);
        double avgPre = average(preScores);
        double avgPost = average(postScores);
        double avgAbsGain = average(absGains);
        double avgRelGain = avgPre > 0 ? ((avgPost - avgPre) / avgPre) * 100.0 : 0.0;
        double avgNormGain = average(normGains);

        double cohensD = calculateCohensD(preScores, postScores);

        long totalAssessments = assessmentResultRepository.count();
        long totalResumes = resumeAnalysisRepository.count();
        long totalInterviews = interviewReportRepository.count();

        return ResearchCohortMetricsDto.builder()
                .totalStudents(students.size())
                .averagePrs(round2(avgPrs))
                .averageConfidence(round2(avgConf))
                .averagePreScore(round2(avgPre))
                .averagePostScore(round2(avgPost))
                .averageAbsoluteGain(round2(avgAbsGain))
                .averageRelativeGainPercentage(round2(avgRelGain))
                .averageNormalizedGain(round2(avgNormGain))
                .cohensD(round2(cohensD))
                .totalAssessmentsCompleted(totalAssessments)
                .totalResumesAnalyzed(totalResumes)
                .totalInterviewsCompleted(totalInterviews)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AnonymizedStudentResearchRecordDto> getAnonymizedResearchRecords() {
        List<User> students = userRepository.findAll().stream()
                .filter(u -> u.getRoles() != null && u.getRoles().stream().anyMatch(r -> r.getName().name().contains("STUDENT")))
                .toList();

        List<AnonymizedStudentResearchRecordDto> list = new ArrayList<>();

        for (User s : students) {
            String anonId = generateAnonymizedHashId(s.getId(), s.getEmail());
            List<AssessmentResult> results = assessmentResultRepository.findByUserIdOrderByCompletedAtDesc(s.getId());
            Optional<PlacementReadinessSnapshot> snapOpt = snapshotRepository.findFirstByUserIdOrderByCreatedAtDesc(s.getId());

            Integer preScore = null;
            Integer postScore = null;
            Integer absGain = null;
            Double relGain = null;
            Double normGain = null;

            if (!results.isEmpty()) {
                postScore = results.get(0).getScorePercentage() != null ? results.get(0).getScorePercentage().intValue() : 0;
                preScore = results.get(results.size() - 1).getScorePercentage() != null ? results.get(results.size() - 1).getScorePercentage().intValue() : 0;
                absGain = postScore - preScore;
                relGain = preScore > 0 ? ((double) (postScore - preScore) / preScore) * 100.0 : 0.0;
                normGain = (100 - preScore > 0) ? ((double) (postScore - preScore) / (100 - preScore)) : 0.0;
            }

            int resumeCount = resumeAnalysisRepository.findByUserIdOrderByCreatedAtDesc(s.getId()).size();
            int interviewCount = interviewReportRepository.findByUserIdOrderByCompletedAtDesc(s.getId()).size();

            list.add(AnonymizedStudentResearchRecordDto.builder()
                    .anonymizedId(anonId)
                    .scoringVersion(PlacementReadinessCalculatorService.SCORING_VERSION)
                    .prsScore(snapOpt.map(PlacementReadinessSnapshot::getPrsScore).orElse(null))
                    .confidenceScore(snapOpt.map(PlacementReadinessSnapshot::getConfidenceScore).orElse(null))
                    .preAssessmentScore(preScore)
                    .postAssessmentScore(postScore)
                    .absoluteImprovement(absGain)
                    .relativeImprovementPercent(relGain != null ? round2(relGain) : null)
                    .normalizedLearningGain(normGain != null ? round2(normGain) : null)
                    .assessmentCount(results.size())
                    .resumeCount(resumeCount)
                    .interviewCount(interviewCount)
                    .calculatedAt(snapOpt.map(PlacementReadinessSnapshot::getCreatedAt).orElse(null))
                    .build());
        }

        return list;
    }

    @Transactional(readOnly = true)
    public String exportAnonymizedResearchCsv() {
        List<AnonymizedStudentResearchRecordDto> records = getAnonymizedResearchRecords();
        StringBuilder csv = new StringBuilder();
        csv.append("Anonymized_ID,Scoring_Version,PRS_Score,Confidence_Score,Pre_Score,Post_Score,Absolute_Gain,Relative_Gain_Percent,Normalized_Gain_g,Assessment_Count,Resume_Count,Interview_Count\n");

        for (AnonymizedStudentResearchRecordDto r : records) {
            csv.append(String.format("%s,%s,%s,%s,%s,%s,%s,%s,%s,%d,%d,%d\n",
                    r.getAnonymizedId(),
                    r.getScoringVersion(),
                    r.getPrsScore() != null ? r.getPrsScore() : "",
                    r.getConfidenceScore() != null ? r.getConfidenceScore() : "",
                    r.getPreAssessmentScore() != null ? r.getPreAssessmentScore() : "",
                    r.getPostAssessmentScore() != null ? r.getPostAssessmentScore() : "",
                    r.getAbsoluteImprovement() != null ? r.getAbsoluteImprovement() : "",
                    r.getRelativeImprovementPercent() != null ? r.getRelativeImprovementPercent() : "",
                    r.getNormalizedLearningGain() != null ? r.getNormalizedLearningGain() : "",
                    r.getAssessmentCount(),
                    r.getResumeCount(),
                    r.getInterviewCount()
            ));
        }

        return csv.toString();
    }

    // Effect Size: Cohen's d calculation
    public double calculateCohensD(List<Double> pre, List<Double> post) {
        if (pre.size() < 2 || post.size() < 2 || pre.size() != post.size()) return 0.0;

        double meanPre = average(pre);
        double meanPost = average(post);

        double varPre = variance(pre, meanPre);
        double varPost = variance(post, meanPost);

        double pooledStdDev = Math.sqrt((varPre + varPost) / 2.0);
        if (pooledStdDev == 0.0) return 0.0;

        return (meanPost - meanPre) / pooledStdDev;
    }

    private double average(List<Double> list) {
        return list.isEmpty() ? 0.0 : list.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
    }

    private double variance(List<Double> list, double mean) {
        if (list.size() <= 1) return 0.0;
        double sum = 0.0;
        for (double v : list) {
            sum += Math.pow(v - mean, 2);
        }
        return sum / (list.size() - 1);
    }

    private double round2(double val) {
        return Math.round(val * 100.0) / 100.0;
    }

    private String generateAnonymizedHashId(Long userId, String email) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest((userId + "_" + email).getBytes());
            return "STUDENT_" + HexFormat.of().formatHex(hash).substring(0, 8).toUpperCase();
        } catch (Exception e) {
            return "STUDENT_" + userId;
        }
    }
}
