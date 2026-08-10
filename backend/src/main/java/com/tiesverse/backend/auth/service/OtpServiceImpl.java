package com.tiesverse.backend.auth.service;

import com.tiesverse.backend.auth.entity.Otp;
import com.tiesverse.backend.auth.repository.OtpRepository;
import com.tiesverse.backend.common.email.SesEmailService;
import com.tiesverse.backend.common.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpServiceImpl implements OtpService {

    private static final int OTP_EXPIRY_MINUTES = 5;
    private final OtpRepository otpRepository;
    private final SesEmailService sesEmailService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    @Transactional
    public void sendOtp(String email, UUID accountId, String type) {
        // Delete any existing unused OTPs of the same type for this email to avoid spam/multiple active OTPs
        otpRepository.deleteByEmailAndType(email, type);

        // Generate 6 digit OTP
        String otpCode = String.format("%06d", secureRandom.nextInt(1000000));

        Otp otp = new Otp();
        otp.setEmail(email);
        otp.setAccountId(accountId);
        otp.setOtpCode(otpCode);
        otp.setType(type);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        otpRepository.save(otp);

        String subject;
        String body;
        if ("EMAIL_VERIFICATION".equals(type)) {
            subject = "Verify your BaseCamp Account";
            body = "Welcome to BaseCamp!\n\n" +
                    "Please verify your email address by entering the following OTP (One-Time Password) in the app:\n\n" +
                    "OTP: " + otpCode + "\n\n" +
                    "This code will expire in " + OTP_EXPIRY_MINUTES + " minutes.\n\n" +
                    "If you did not request this, you can ignore this email.";
        } else {
            subject = "BaseCamp Login OTP (2FA)";
            body = "Hello,\n\n" +
                    "A login attempt was made on your BaseCamp account. To proceed, please enter the following OTP (One-Time Password) code:\n\n" +
                    "OTP: " + otpCode + "\n\n" +
                    "This code will expire in " + OTP_EXPIRY_MINUTES + " minutes.\n\n" +
                    "If you did not attempt to sign in, please secure your account immediately.";
        }

        sesEmailService.sendEmail(email, subject, body);
        log.info("Successfully sent {} OTP to {}", type, email);
    }

    @Override
    @Transactional
    public Otp verifyOtp(String email, String otpCode) {
        // Find latest unused OTP for this email
        // We look for either EMAIL_VERIFICATION or LOGIN_MFA, checking both types because verifyOtp takes email & otp
        // and needs to know which OTP is matching. Let's check both or find the latest active OTP across all types
        // for that email.
        Otp activeOtp = otpRepository.findFirstByEmailAndTypeAndUsedAtIsNullOrderByCreatedAtDesc(email, "LOGIN_MFA")
                .or(() -> otpRepository.findFirstByEmailAndTypeAndUsedAtIsNullOrderByCreatedAtDesc(email, "EMAIL_VERIFICATION"))
                .orElseThrow(() -> new UnauthorizedException("No active OTP request found for this email. Please request a new OTP."));

        if (activeOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("This OTP has expired. Please request a new one.");
        }

        if (!activeOtp.getOtpCode().equals(otpCode)) {
            throw new UnauthorizedException("Invalid OTP code. Please try again.");
        }

        activeOtp.setUsedAt(LocalDateTime.now());
        otpRepository.save(activeOtp);

        return activeOtp;
    }
}
