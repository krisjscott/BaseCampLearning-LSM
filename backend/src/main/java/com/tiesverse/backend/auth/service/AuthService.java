package com.tiesverse.backend.auth.service;

import com.tiesverse.backend.auth.dto.request.ForgotPasswordRequest;
import com.tiesverse.backend.auth.dto.request.LoginRequest;
import com.tiesverse.backend.auth.dto.request.OtpRequest;
import com.tiesverse.backend.auth.dto.request.RefreshTokenRequest;
import com.tiesverse.backend.auth.dto.request.RegisterRequest;
import com.tiesverse.backend.auth.dto.request.ResetPasswordRequest;
import com.tiesverse.backend.auth.dto.request.VerifyEmailRequest;
import com.tiesverse.backend.auth.dto.response.AuthResponse;
import com.tiesverse.backend.auth.dto.response.TokenResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    TokenResponse refreshToken(RefreshTokenRequest request);

    void logout(String email);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);

    void verifyEmail(VerifyEmailRequest request);

    void verifyOtp(OtpRequest request);
}
