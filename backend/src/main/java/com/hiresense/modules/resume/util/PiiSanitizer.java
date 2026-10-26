package com.hiresense.modules.resume.util;

import java.util.regex.Pattern;

public class PiiSanitizer {

    // Regex for Email Addresses
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
            Pattern.CASE_INSENSITIVE
    );

    // Regex for Phone Numbers (Indian & International formats: +91, 10 digits, hyphens/spaces)
    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "(?:\\+?\\d{1,3}[-.\\s]?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}|\\b\\d{10}\\b"
    );

    // Regex for Pincodes / Zip codes
    private static final Pattern PINCODE_PATTERN = Pattern.compile(
            "\\b\\d{6}\\b|\\b\\d{5}(?:-\\d{4})?\\b"
    );

    public static String sanitize(String rawResumeText) {
        if (rawResumeText == null) return "";

        String sanitized = EMAIL_PATTERN.matcher(rawResumeText).replaceAll("[EMAIL REDACTED]");
        sanitized = PHONE_PATTERN.matcher(sanitized).replaceAll("[PHONE REDACTED]");
        sanitized = PINCODE_PATTERN.matcher(sanitized).replaceAll("[PINCODE REDACTED]");

        return sanitized;
    }
}
