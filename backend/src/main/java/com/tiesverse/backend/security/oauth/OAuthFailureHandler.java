package com.tiesverse.backend.security.oauth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Slf4j
@Component
public class OAuthFailureHandler implements AuthenticationFailureHandler {

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {
        log.warn("Google OAuth failed: {}", exception.getMessage(), exception);
        response.sendRedirect(UriComponentsBuilder.fromUriString(frontendUrl + "/oauth/callback")
                .queryParam("error", exception.getMessage() != null && !exception.getMessage().isBlank()
                        ? exception.getMessage()
                        : "Could not sign in with Google")
                .build()
                .encode()
                .toUriString());
    }
}
