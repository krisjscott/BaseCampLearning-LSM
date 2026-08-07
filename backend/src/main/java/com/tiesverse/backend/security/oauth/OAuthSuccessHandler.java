package com.tiesverse.backend.security.oauth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuthSuccessHandler implements AuthenticationSuccessHandler {

    private final GoogleOAuthService googleOAuthService;
    private final OAuthExchangeService exchangeService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                         Authentication authentication) throws IOException {
        response.setHeader("Cache-Control", "no-store");
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String googleId = oAuth2User.getAttribute("sub");
        String fullName = oAuth2User.getAttribute("name");
        String pictureUrl = oAuth2User.getAttribute("picture");
        String phoneNumber = oAuth2User.getAttribute("phone_number");
        Boolean emailVerified = oAuth2User.getAttribute("email_verified");

        if (email == null || googleId == null) {
            redirectWithError(response, "Google did not share an email address for this account.");
            return;
        }
        // If Google's own claim doesn't confirm this Google identity actually owns the
        // email, don't let it auto-link to (and thereafter log into) whatever local
        // account already holds that address.
        if (!Boolean.TRUE.equals(emailVerified)) {
            redirectWithError(response, "Google did not verify this email address.");
            return;
        }

        GoogleOAuthService.GoogleAuthentication googleAuthentication;
        try {
            googleAuthentication = googleOAuthService.authenticate(googleId, email, fullName, pictureUrl, phoneNumber);
        } catch (IllegalStateException ex) {
            redirectWithError(response, ex.getMessage());
            return;
        }

        String exchangeCode = exchangeService.createCode(googleAuthentication);
        String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl)
                .path("/oauth/callback")
                .queryParam("code", exchangeCode)
                .build()
                .encode()
                .toUriString();

        response.sendRedirect(redirectUrl);
    }

    private void redirectWithError(HttpServletResponse response, String message) throws IOException {
        response.sendRedirect(UriComponentsBuilder.fromUriString(frontendUrl + "/oauth/callback")
                .queryParam("error", message)
                .build()
                .encode()
                .toUriString());
    }
}
