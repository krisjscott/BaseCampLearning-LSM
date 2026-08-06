package com.tiesverse.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration;

// Google sign-in (AuthProvider.GOOGLE) is not wired to Spring Security's
// managed OAuth2 login flow, so this autoconfiguration is unused - and left
// enabled it hard-fails startup whenever GOOGLE_CLIENT_ID/SECRET are unset,
// which is the default for local/dev environments.
@SpringBootApplication(exclude = OAuth2ClientAutoConfiguration.class)
public class BaseCampLearningApplication {

    public static void main(String[] args) {
        SpringApplication.run(BaseCampLearningApplication.class, args);
    }
}
