package com.hiresense.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleAuthRequest {

    @NotBlank(message = "Google email is required")
    @Email(message = "Google email format is invalid")
    private String email;

    private String googleId;

    private String firstName;

    private String lastName;

    private String pictureUrl;

    private String credential; // OAuth2 / ID token or One-Tap credential
}
