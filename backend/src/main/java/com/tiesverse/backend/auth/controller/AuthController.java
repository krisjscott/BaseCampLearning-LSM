package com.tiesverse.backend.auth.controller;

import com.tiesverse.backend.auth.dto.request.ChangePasswordRequest;
import com.tiesverse.backend.auth.dto.request.ForgotPasswordRequest;
import com.tiesverse.backend.auth.dto.request.LoginRequest;
import com.tiesverse.backend.auth.dto.request.OtpRequest;
import com.tiesverse.backend.auth.dto.request.RefreshTokenRequest;
import com.tiesverse.backend.auth.dto.request.RegisterRequest;
import com.tiesverse.backend.auth.dto.request.ResendOtpRequest;
import com.tiesverse.backend.auth.dto.request.ResetPasswordRequest;
import com.tiesverse.backend.auth.dto.request.VerifyEmailRequest;
import com.tiesverse.backend.auth.dto.response.AuthResponse;
import com.tiesverse.backend.auth.dto.response.TokenResponse;
import com.tiesverse.backend.auth.service.AuthService;
import com.tiesverse.backend.common.response.ApiResponse;
import com.tiesverse.backend.security.AuthContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AuthContext authContext;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        TokenResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(Principal principal) {
        authService.logout(authContext.currentAccount(principal).getEmail());
        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Principal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(authContext.currentAccount(principal).getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset email sent", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successful", null));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully", null));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody OtpRequest request) {
        AuthResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully", response));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Void>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        authService.resendOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP resent successfully", null));
    }
}
