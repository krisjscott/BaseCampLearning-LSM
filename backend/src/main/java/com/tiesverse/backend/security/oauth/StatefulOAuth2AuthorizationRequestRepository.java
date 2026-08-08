package com.tiesverse.backend.security.oauth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class StatefulOAuth2AuthorizationRequestRepository
        implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    private static final Duration AUTH_REQUEST_TTL = Duration.ofMinutes(10);

    private final Map<String, StoredAuthorizationRequest> requests = new ConcurrentHashMap<>();

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        String state = request.getParameter("state");
        if (!StringUtils.hasText(state)) {
            return null;
        }

        StoredAuthorizationRequest stored = requests.get(state);
        if (stored == null) {
            return null;
        }

        if (stored.isExpired()) {
            requests.remove(state);
            log.debug("Expired OAuth authorization request discarded for state={}", state);
            return null;
        }

        return stored.authorizationRequest();
    }

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest,
                                         HttpServletRequest request,
                                         HttpServletResponse response) {
        if (authorizationRequest == null) {
            removeAuthorizationRequest(request, response);
            return;
        }

        String state = authorizationRequest.getState();
        if (!StringUtils.hasText(state)) {
            throw new IllegalArgumentException("OAuth authorization request is missing state");
        }

        cleanupExpiredRequests();
        requests.put(state, new StoredAuthorizationRequest(authorizationRequest, Instant.now().plus(AUTH_REQUEST_TTL)));
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request,
                                                                 HttpServletResponse response) {
        String state = request.getParameter("state");
        if (!StringUtils.hasText(state)) {
            return null;
        }

        StoredAuthorizationRequest stored = requests.remove(state);
        if (stored == null || stored.isExpired()) {
            return null;
        }

        return stored.authorizationRequest();
    }

    private void cleanupExpiredRequests() {
        Instant now = Instant.now();
        requests.entrySet().removeIf(entry -> entry.getValue().expiresAt().isBefore(now));
    }

    private record StoredAuthorizationRequest(
            OAuth2AuthorizationRequest authorizationRequest,
            Instant expiresAt
    ) {
        boolean isExpired() {
            return expiresAt.isBefore(Instant.now());
        }
    }
}
