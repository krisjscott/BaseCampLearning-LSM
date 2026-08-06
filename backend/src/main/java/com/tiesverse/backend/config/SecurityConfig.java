package com.tiesverse.backend.config;

import com.tiesverse.backend.security.jwt.JwtAuthenticationEntryPoint;
import com.tiesverse.backend.security.jwt.JwtFilter;
import com.tiesverse.backend.security.oauth.OAuthFailureHandler;
import com.tiesverse.backend.security.oauth.OAuthSuccessHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    // Deliberately injected as @Bean method parameters below, not through this
    // class's own constructor: JwtFilter/OAuthSuccessHandler/OAuthFailureHandler
    // all resolve down to AccountRepository, and constructor-injecting them
    // here forced that whole JPA repository chain to be built while
    // SecurityConfig itself is still being constructed - which, once
    // oauth2Login() was added below, started racing the JPA
    // EntityManagerFactory's own startup and failing with "Not a managed
    // type: Account". Method-parameter injection lets Spring resolve these
    // through the normal bean graph at @Bean-method-call time instead.

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtFilter jwtFilter,
                                                     JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
                                                     OAuthSuccessHandler oAuthSuccessHandler,
                                                     OAuthFailureHandler oAuthFailureHandler) throws Exception {
        http
                        .csrf(AbstractHttpConfigurer::disable)
                        .cors(cors -> {})
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .sessionManagement(session -> session
                        // Google's oauth2Login handshake stores its "state" parameter in the
                        // HTTP session (CSRF protection for the redirect back from Google) -
                        // STATELESS would drop that mid-flow. IF_REQUIRED only creates a
                        // session when something actually asks for one (the OAuth dance);
                        // every JWT-bearer API request still never triggers a session.
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oAuthSuccessHandler)
                        .failureHandler(oAuthFailureHandler))
                        .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/v1/auth/register",
                                "/api/v1/auth/login",
                                "/api/v1/auth/refresh",
                                "/api/v1/auth/forgot-password",
                                "/api/v1/auth/reset-password",
                                "/api/v1/auth/verify-email",
                                "/api/v1/auth/verify-otp",
                                "/oauth2/**",
                                "/login/oauth2/**",
                                "/actuator/health",
                                "/actuator/info"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/certificates/verify/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/courses/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/search/**").permitAll()
                        .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html")
                        .hasAnyRole("HR_ADMIN", "ORGANIZATION_ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/actuator/**")
                        .hasRole("SUPER_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/assessments/submit").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/assessments/results/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/assessments/results").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/courses/**", "/api/v1/contents/**", "/api/v1/assessments/**")
                        .hasAnyRole("TRAINER", "HR_ADMIN", "ORGANIZATION_ADMIN", "SUPER_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/courses/**", "/api/v1/contents/**", "/api/v1/assessments/**")
                        .hasAnyRole("TRAINER", "HR_ADMIN", "ORGANIZATION_ADMIN", "SUPER_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/courses/**", "/api/v1/contents/**", "/api/v1/assessments/**")
                        .hasAnyRole("TRAINER", "HR_ADMIN", "ORGANIZATION_ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/v1/admin/**")
                        .hasAnyRole("TRAINER", "HR_ADMIN", "ORGANIZATION_ADMIN", "SUPER_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/enrollments/assign", "/api/v1/enrollments/learning-paths")
                        .hasAnyRole("HR_ADMIN", "ORGANIZATION_ADMIN", "SUPER_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/enrollments/**")
                        .hasAnyRole("HR_ADMIN", "ORGANIZATION_ADMIN", "SUPER_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/enrollments/course/**", "/api/v1/enrollments/learning-paths")
                        .hasAnyRole("HR_ADMIN", "ORGANIZATION_ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/v1/organizations/**").hasAnyRole("ORGANIZATION_ADMIN", "HR_ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/v1/analytics/**").hasAnyRole("HR_ADMIN", "ORGANIZATION_ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/v1/dashboard/admin").hasAnyRole("HR_ADMIN", "ORGANIZATION_ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/v1/dashboard/employee").hasAnyRole("EMPLOYEE", "HR_ADMIN", "ORGANIZATION_ADMIN", "SUPER_ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
