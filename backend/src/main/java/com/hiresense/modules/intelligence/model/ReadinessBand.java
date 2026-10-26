package com.hiresense.modules.intelligence.model;

public enum ReadinessBand {
    EXCELLENT("Excellent Readiness", "Candidate displays superior alignment across foundational and advanced technical benchmarks."),
    GOOD("Good Readiness", "Candidate shows solid proficiency with minor targeted skill improvements needed."),
    DEVELOPING("Developing Readiness", "Candidate demonstrates core foundational concepts but requires systematic practice in key technical dimensions."),
    NEEDS_IMPROVEMENT("Needs Improvement", "Candidate has significant preparation gaps across diagnostic dimensions requiring comprehensive remediation.");

    private final String displayName;
    private final String description;

    ReadinessBand(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public static ReadinessBand fromScore(int score) {
        if (score >= 85) return EXCELLENT;
        if (score >= 70) return GOOD;
        if (score >= 55) return DEVELOPING;
        return NEEDS_IMPROVEMENT;
    }
}
