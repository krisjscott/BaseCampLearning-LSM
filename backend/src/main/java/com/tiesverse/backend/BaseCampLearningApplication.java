package com.tiesverse.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Google sign-in is now wired to Spring Security's oauth2Login() flow (see
// SecurityConfig) - this used to be excluded because it hard-failed startup
// whenever GOOGLE_CLIENT_ID/SECRET were unset; application.yml/-dev.yml now
// default both to a non-blank placeholder so the app still boots without
// real credentials, it just can't complete a real Google sign-in until they're set.
@SpringBootApplication
public class BaseCampLearningApplication {

    public static void main(String[] args) {
        SpringApplication.run(BaseCampLearningApplication.class, args);
    }
}
