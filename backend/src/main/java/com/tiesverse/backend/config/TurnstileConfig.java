package com.tiesverse.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "turnstile")
public class TurnstileConfig {
    private String secretKey;
    private boolean enabled = false;
}
