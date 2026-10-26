package com.hiresense.modules.companyprep.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyPrepDto {
    private String id;
    private String companyName;
    private String tier;
    private String sector;
    private String fortuneRank;
    private String headquarters;
    private String employeeCount;
    private String difficultyRating;
    private String interviewProcessDuration;
    private String logoUrl;
    private String overview;
    private String hiringWorkflow;
    private String packageRange;
    private List<String> focusSkills;
    private List<String> aptitudeTopics;
    private List<String> technicalTopics;
    private List<InterviewQuestionItem> technicalQuestions;
    private List<InterviewQuestionItem> hrQuestions;
    private List<CompanyRoleInfo> roles;
    private List<CompanyHiringRound> rounds;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InterviewQuestionItem {
        private String question;
        private String category;
        private String guidance;
        private String sampleAnswer;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompanyRoleInfo {
        private String roleTitle;
        private String level;
        private String baseSalary;
        private String stocksAndBonuses;
        private String totalCTC;
        private List<String> primarySkills;
        private String keyResponsibilities;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompanyHiringRound {
        private int roundNumber;
        private String title;
        private String type;
        private String duration;
        private String description;
        private List<String> keyFocus;
    }
}
