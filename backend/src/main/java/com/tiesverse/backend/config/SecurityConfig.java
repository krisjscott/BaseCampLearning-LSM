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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final OAuthSuccessHandler oAuthSuccessHandler;
    private final OAuthFailureHandler oAuthFailureHandler;

    public SecurityConfig(
            JwtFilter jwtFilter,
            JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
            OAuthSuccessHandler oAuthSuccessHandler,
            OAuthFailureHandler oAuthFailureHandler
    ) {
        this.jwtFilter = jwtFilter;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
        this.oAuthSuccessHandler = oAuthSuccessHandler;
        this.oAuthFailureHandler = oAuthFailureHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                        .csrf(AbstractHttpConfigurer::disable)
                        .cors(cors -> {})
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
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
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oAuthSuccessHandler)
                        .failureHandler(oAuthFailureHandler))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
