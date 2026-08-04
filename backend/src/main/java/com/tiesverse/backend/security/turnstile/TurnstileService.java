package com.tiesverse.backend.security.turnstile;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tiesverse.backend.common.exception.BadRequestException;
import com.tiesverse.backend.config.TurnstileConfig;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TurnstileService {

    private static final String TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    private final TurnstileConfig turnstileConfig;
    private final RestTemplate restTemplate = new RestTemplate();

    public void verify(String token) {
        if (!turnstileConfig.isEnabled()) {
            log.debug("Turnstile verification is disabled");
            return;
        }

        if (token == null || token.isBlank()) {
            throw new BadRequestException("Turnstile token is required");
        }

        String clientIp = getClientIp();

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("secret", turnstileConfig.getSecretKey());
        formData.add("response", token);
        if (clientIp != null && !clientIp.isBlank()) {
            formData.add("remoteip", clientIp);
        }

        try {
            TurnstileResponse response = restTemplate.postForObject(
                    TURNSTILE_VERIFY_URL,
                    formData,
                    TurnstileResponse.class
            );

            if (response == null) {
                log.error("Turnstile siteverify returned null response");
                throw new BadRequestException("Failed to verify Turnstile token");
            }

            if (!response.isSuccess()) {
                log.warn("Turnstile verification failed: error-codes={}", response.getErrorCodes());
                throw new BadRequestException("Invalid Turnstile token");
            }

            log.debug("Turnstile verification successful");
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error verifying Turnstile token", e);
            throw new BadRequestException("Failed to verify Turnstile token");
        }
    }

    private String getClientIp() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) {
                return null;
            }
            HttpServletRequest request = attrs.getRequest();
            String xfwd = request.getHeader("X-Forwarded-For");
            if (xfwd != null && !xfwd.isBlank()) {
                return xfwd.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        } catch (Exception e) {
            log.debug("Could not determine client IP", e);
            return null;
        }
    }

    @Data
    private static class TurnstileResponse {
        private boolean success;

        @JsonProperty("error-codes")
        private List<String> errorCodes;

        private String challenge;
        private String hostname;
        private String action;
    }
}
