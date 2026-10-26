package com.hiresense.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    /**
     * Accepts either email address (e.g. student@gmail.com) or mobile phone number (e.g. 9876543210)
     */
    @NotBlank(message = "Email or mobile number is required")
    private String email;

    private String identifier;

    @NotBlank(message = "Password is required")
    private String password;

    public String getResolvedIdentifier() {
        if (identifier != null && !identifier.isBlank()) {
            return identifier.trim();
        }
        return email != null ? email.trim() : "";
    }
}
