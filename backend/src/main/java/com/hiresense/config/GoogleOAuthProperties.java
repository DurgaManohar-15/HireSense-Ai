package com.hiresense.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "hiresense.oauth.google")
public class GoogleOAuthProperties {

    /**
     * Google Cloud OAuth 2.0 Client ID (Web application)
     */
    private String clientId;

    /**
     * Google Cloud OAuth 2.0 Client Secret
     */
    private String clientSecret;

    /**
     * Exact redirect URI registered in Google Cloud Console
     * Example: http://localhost:8080/api/v1/auth/google/callback
     */
    private String redirectUri = "http://localhost:8080/api/v1/auth/google/callback";

    /**
     * Frontend redirect destination upon successful authentication
     * Example: http://localhost:5173/auth/callback
     */
    private String frontendRedirectUrl = "http://localhost:5173/auth/callback";

    /**
     * Frontend login page destination on error / cancellation
     */
    private String frontendLoginUrl = "http://localhost:5173/login";
}
