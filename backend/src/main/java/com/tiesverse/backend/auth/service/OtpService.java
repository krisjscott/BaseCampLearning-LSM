package com.tiesverse.backend.auth.service;

import com.tiesverse.backend.auth.entity.Otp;

import java.util.UUID;

public interface OtpService {
    void sendOtp(String email, UUID accountId, String type);
    Otp verifyOtp(String email, String otpCode);
}
