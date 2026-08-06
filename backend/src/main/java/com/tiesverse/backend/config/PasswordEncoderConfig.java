package com.tiesverse.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Split out of SecurityConfig: GoogleOAuthService needs a PasswordEncoder,
 * and SecurityConfig's constructor now needs OAuthSuccessHandler (which
 * needs GoogleOAuthService) - keeping the encoder bean method on SecurityConfig
 * itself made that a circular dependency (Spring can't finish constructing
 * SecurityConfig to expose the @Bean method until the handler chain it
 * depends on is already resolved).
 */
@Configuration
public class PasswordEncoderConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
