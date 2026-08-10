package com.tiesverse.backend.auth.service;

import com.tiesverse.backend.auth.dto.request.ChangePasswordRequest;
import com.tiesverse.backend.auth.dto.request.ForgotPasswordRequest;
import com.tiesverse.backend.auth.dto.request.LoginRequest;
import com.tiesverse.backend.auth.dto.request.OtpRequest;
import com.tiesverse.backend.auth.dto.request.RefreshTokenRequest;
import com.tiesverse.backend.auth.dto.request.RegisterRequest;
import com.tiesverse.backend.auth.dto.request.ResetPasswordRequest;
import com.tiesverse.backend.auth.dto.request.ResendOtpRequest;
import com.tiesverse.backend.auth.dto.request.VerifyEmailRequest;
import com.tiesverse.backend.auth.dto.response.AuthResponse;
import com.tiesverse.backend.auth.dto.response.TokenResponse;

import java.util.UUID;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    TokenResponse refreshToken(RefreshTokenRequest request);

    void logout(String email);

    void changePassword(UUID accountId, ChangePasswordRequest request);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);

    void verifyEmail(VerifyEmailRequest request);

    AuthResponse verifyOtp(OtpRequest request);

    void resendOtp(ResendOtpRequest request);
}
