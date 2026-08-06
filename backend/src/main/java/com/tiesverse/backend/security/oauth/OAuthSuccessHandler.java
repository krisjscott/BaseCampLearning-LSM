package com.tiesverse.backend.security.oauth;

import com.tiesverse.backend.auth.entity.Account;
import com.tiesverse.backend.auth.repository.AccountRepository;
import com.tiesverse.backend.security.jwt.JwtProvider;
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
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuthSuccessHandler implements AuthenticationSuccessHandler {

    private final GoogleOAuthService googleOAuthService;
    private final AccountRepository accountRepository;
    private final JwtProvider jwtProvider;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                         Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Account account = googleOAuthService.findOrCreateAccount(oAuth2User);

        if (!account.isActive()) {
            response.sendRedirect(UriComponentsBuilder.fromUriString(frontendUrl + "/oauth/callback")
                    .queryParam("error", "This account has been deactivated")
                    .build()
                    .encode()
                    .toUriString());
            return;
        }

        String accessToken = jwtProvider.generateToken(account.getEmail(), Map.of("role", account.getRole().name()));
        String refreshToken = jwtProvider.generateRefreshToken(account.getEmail());

        account.setRefreshToken(refreshToken);
        accountRepository.save(account);

        String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth/callback")
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .queryParam("email", account.getEmail())
                .queryParam("role", account.getRole().name())
                .build()
                .encode()
                .toUriString();

        response.sendRedirect(redirectUrl);
    }
}
