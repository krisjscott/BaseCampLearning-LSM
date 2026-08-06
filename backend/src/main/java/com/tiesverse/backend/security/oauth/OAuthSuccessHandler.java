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

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String googleId = oAuth2User.getAttribute("sub");
        String fullName = oAuth2User.getAttribute("name");
        String pictureUrl = oAuth2User.getAttribute("picture");

        if (email == null || googleId == null) {
            response.sendRedirect(frontendUrl + "/?oauthError=google-profile-incomplete");
            return;
        }

        GoogleOAuthService.GoogleAuthentication googleAuthentication = googleOAuthService.authenticate(
                googleId, email, fullName == null ? email : fullName, pictureUrl);
        var auth = googleAuthentication.auth();
        String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl)
                .path("/oauth/callback")
                .queryParam("accessToken", auth.getAccessToken())
                .queryParam("refreshToken", auth.getRefreshToken())
                .queryParam("email", auth.getEmail())
                .queryParam("role", auth.getRole().name())
                .queryParam("fullName", auth.getFullName())
                .queryParam("newUser", googleAuthentication.newUser())
                .build()
                .encode()
                .toUriString();
        response.sendRedirect(redirectUrl);
    }
}
