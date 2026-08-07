package com.tiesverse.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.util.pattern.PathPatternParser;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins:}")
    private String configuredAllowedOrigins;

    @Value("${app.frontend-url:}")
    private String frontendUrl;

    @Value("${spring.profiles.active:}")
    private String activeProfiles;

    @Autowired
    private Environment environment;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        List<String> allowedOrigins = new ArrayList<>();

        if (allowsLocalDevelopmentOrigins()) {
            allowedOrigins.addAll(List.of(
                    "http://localhost:*",
                    "http://127.0.0.1:*",
                    "http://[::1]:*"
            ));
        }

        if (configuredAllowedOrigins != null && !configuredAllowedOrigins.isBlank()) {
            allowedOrigins.addAll(Arrays.stream(configuredAllowedOrigins.split(","))
                    .map(String::trim)
                    .filter(origin -> !origin.isBlank())
                    .toList());
        }

        // The OAuth success handler redirects to this same frontend URL, and
        // the browser then POSTs the one-time code back to the API. Keeping
        // FRONTEND_URL in the CORS set prevents that exchange from depending
        // on a second, easy-to-miss environment variable.
        if (frontendUrl != null && !frontendUrl.isBlank()) {
            allowedOrigins.add(frontendUrl.trim().replaceAll("/$", ""));
        }

        config.setAllowedOriginPatterns(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        // Keep this explicit because browsers can reject wildcard CORS
        // headers when credentials are enabled, even if the preflight itself
        // reaches the server successfully.
        config.setAllowedHeaders(List.of(
                "Accept",
                "Authorization",
                "Content-Type",
                "Origin",
                "X-Requested-With"
        ));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource(new PathPatternParser());
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    private boolean allowsLocalDevelopmentOrigins() {
        String profiles = activeProfiles == null ? "" : activeProfiles.toLowerCase();
        return profiles.contains("local") || profiles.contains("dev");
    }
}
