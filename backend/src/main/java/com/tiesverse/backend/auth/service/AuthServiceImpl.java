package com.tiesverse.backend.auth.service;

import com.tiesverse.backend.auth.dto.request.ForgotPasswordRequest;
import com.tiesverse.backend.auth.dto.request.ChangePasswordRequest;
import com.tiesverse.backend.auth.dto.request.LoginRequest;
import com.tiesverse.backend.auth.dto.request.OtpRequest;
import com.tiesverse.backend.auth.dto.request.RefreshTokenRequest;
import com.tiesverse.backend.auth.dto.request.RegisterRequest;
import com.tiesverse.backend.auth.dto.request.ResetPasswordRequest;
import com.tiesverse.backend.auth.dto.request.ResendOtpRequest;
import com.tiesverse.backend.auth.dto.request.VerifyEmailRequest;
import com.tiesverse.backend.auth.dto.response.AuthResponse;
import com.tiesverse.backend.auth.dto.response.TokenResponse;
import com.tiesverse.backend.auth.entity.Account;
import com.tiesverse.backend.auth.entity.Otp;
import com.tiesverse.backend.auth.entity.PasswordResetToken;
import com.tiesverse.backend.auth.mapper.AuthMapper;
import com.tiesverse.backend.auth.repository.AccountRepository;
import com.tiesverse.backend.auth.repository.PasswordResetTokenRepository;
import com.tiesverse.backend.auth.service.OtpService;
import com.tiesverse.backend.common.enums.AuthProvider;
import com.tiesverse.backend.common.enums.Role;
import com.tiesverse.backend.common.exception.ConflictException;
import com.tiesverse.backend.common.exception.UnauthorizedException;
import com.tiesverse.backend.common.util.TokenHashUtil;
import com.tiesverse.backend.security.jwt.JwtProvider;
import com.tiesverse.backend.security.turnstile.TurnstileService;
import com.tiesverse.backend.user.entity.User;
import com.tiesverse.backend.user.entity.UserSettings;
import com.tiesverse.backend.user.repository.UserRepository;
import com.tiesverse.backend.user.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private static final int RESET_TOKEN_BYTES = 32;
    private static final int RESET_TOKEN_MINUTES = 30;
    // A fixed, valid BCrypt hash to compare against when no account was found, so a
    // login attempt against a non-existent email takes comparable time to a wrong-password
    // attempt against a real one - otherwise the response-time gap lets an attacker
    // enumerate registered emails via login().
    private static final String DUMMY_PASSWORD_HASH =
            new BCryptPasswordEncoder().encode("account-enumeration-timing-defense");

    private final AccountRepository accountRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;
    private final TurnstileService turnstileService;
    private final JavaMailSender mailSender;
    private final OtpService otpService;

    @Value("${app.password-reset-url:${app.frontend-url}/recover-access}")
    private String passwordResetUrl;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        turnstileService.verify(request.getTurnstileToken());
        String email = request.getEmail().trim().toLowerCase();

        if (accountRepository.existsByEmail(email)) {
            throw new ConflictException("This email is already used for sign-in, please login");
        }

        Account account = Account.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.PUBLIC_USER)
                .authProvider(AuthProvider.LOCAL)
                .emailVerified(false)
                .build();

        Account savedAccount = accountRepository.save(account);
        User savedUser = userRepository.save(User.builder()
                .fullName(request.getFullName())
                .accountId(savedAccount.getId())
                .build());

        savedAccount.setUserId(savedUser.getId());
        savedAccount = accountRepository.save(savedAccount);

        userSettingsRepository.save(UserSettings.builder()
                .userId(savedUser.getId())
                .emailNotifications(true)
                .pushNotifications(true)
                .language("en")
                .timezone("Asia/Kolkata")
                .build());

        otpService.sendOtp(savedAccount.getEmail(), savedAccount.getId(), "EMAIL_VERIFICATION");

        return AuthResponse.builder()
                .email(savedAccount.getEmail())
                .fullName(request.getFullName())
                .role(savedAccount.getRole())
                .emailVerificationRequired(true)
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        turnstileService.verify(request.getTurnstileToken());

        Optional<Account> accountOpt = accountRepository.findByEmail(request.getEmail());
        boolean passwordMatches = accountOpt.isPresent()
                ? passwordEncoder.matches(request.getPassword(), accountOpt.get().getPassword())
                : matchesDummyHashForTiming(request.getPassword());

        if (accountOpt.isEmpty() || !passwordMatches) {
            throw new UnauthorizedException("Invalid email or password");
        }
        Account account = accountOpt.get();

        if (!account.isActive()) {
            throw new UnauthorizedException("This account has been deactivated");
        }

        if (!account.isEmailVerified()) {
            otpService.sendOtp(account.getEmail(), account.getId(), "EMAIL_VERIFICATION");
            return AuthResponse.builder()
                    .email(account.getEmail())
                    .role(account.getRole())
                    .emailVerificationRequired(true)
                    .build();
        }

        otpService.sendOtp(account.getEmail(), account.getId(), "LOGIN_MFA");

        return AuthResponse.builder()
                .email(account.getEmail())
                .role(account.getRole())
                .mfaRequired(true)
                .build();
    }

    private boolean matchesDummyHashForTiming(String rawPassword) {
        passwordEncoder.matches(rawPassword, DUMMY_PASSWORD_HASH);
        return false;
    }

    @Override
    public TokenResponse refreshToken(RefreshTokenRequest request) {
        Account account = accountRepository.findByRefreshToken(TokenHashUtil.sha256Hex(request.getRefreshToken()))
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));
        if (!jwtProvider.isTokenValid(request.getRefreshToken(), account.getEmail())) {
            account.setRefreshToken(null);
            accountRepository.save(account);
            throw new UnauthorizedException("Invalid refresh token");
        }

        if (!account.isActive()) {
            throw new UnauthorizedException("This account has been deactivated");
        }

        String accessToken = jwtProvider.generateToken(
                account.getEmail(),
                Map.of("role", account.getRole().name())
        );
        String newRefreshToken = jwtProvider.generateRefreshToken(account.getEmail());

        account.setRefreshToken(TokenHashUtil.sha256Hex(newRefreshToken));
        accountRepository.save(account);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(newRefreshToken)
                .expiresIn(3600)
                .build();
    }

    @Override
    public void logout(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Account not found"));
        account.setRefreshToken(null);
        accountRepository.save(account);
    }

    @Override
    @Transactional
    public void changePassword(UUID accountId, ChangePasswordRequest request) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new UnauthorizedException("Account not found"));
        if (!passwordEncoder.matches(request.getCurrentPassword(), account.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect");
        }
        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new IllegalArgumentException("New password must be different from the current password");
        }
        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        account.setRefreshToken(null);
        accountRepository.save(account);
        passwordResetTokenRepository.deleteByAccountIdAndUsedAtIsNull(account.getId());
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        turnstileService.verify(request.getTurnstileToken());
        accountRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .ifPresent(this::createAndSendResetToken);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByTokenHashAndUsedAtIsNull(TokenHashUtil.sha256Hex(request.getToken()))
                .orElseThrow(() -> new UnauthorizedException("This password reset link is invalid or expired"));
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("This password reset link is invalid or expired");
        }

        Account account = accountRepository.findById(resetToken.getAccountId())
                .orElseThrow(() -> new UnauthorizedException("Account not found"));
        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        account.setRefreshToken(null);
        accountRepository.save(account);
        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);
        passwordResetTokenRepository.deleteByAccountIdAndUsedAtIsNull(account.getId());
    }

    @Override
    public void verifyEmail(VerifyEmailRequest request) {
        throw new RuntimeException("Not implemented");
    }

    @Override
    @Transactional
    public AuthResponse verifyOtp(OtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        Otp otp = otpService.verifyOtp(email, request.getOtp());

        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Account not found"));

        if (!account.isActive()) {
            throw new UnauthorizedException("This account has been deactivated");
        }

        if ("EMAIL_VERIFICATION".equals(otp.getType())) {
            account.setEmailVerified(true);
        }

        String accessToken = jwtProvider.generateToken(
                account.getEmail(),
                Map.of("role", account.getRole().name())
        );
        String refreshToken = jwtProvider.generateRefreshToken(account.getEmail());

        account.setRefreshToken(TokenHashUtil.sha256Hex(refreshToken));
        accountRepository.save(account);

        String fullName = userRepository.findById(account.getUserId())
                .map(User::getFullName)
                .orElse(account.getEmail());

        return AuthMapper.INSTANCE.toAuthResponse(account, accessToken, refreshToken, fullName);
    }

    @Override
    @Transactional
    public void resendOtp(ResendOtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Account not found"));

        if (!account.isActive()) {
            throw new UnauthorizedException("This account has been deactivated");
        }

        String type = request.getType();
        if (!"EMAIL_VERIFICATION".equals(type) && !"LOGIN_MFA".equals(type)) {
            throw new IllegalArgumentException("Invalid OTP type");
        }

        otpService.sendOtp(email, account.getId(), type);
    }

    private void createAndSendResetToken(Account account) {
        passwordResetTokenRepository.deleteByAccountIdAndUsedAtIsNull(account.getId());

        byte[] bytes = new byte[RESET_TOKEN_BYTES];
        new SecureRandom().nextBytes(bytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setAccountId(account.getId());
        resetToken.setTokenHash(TokenHashUtil.sha256Hex(rawToken));
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(RESET_TOKEN_MINUTES));
        passwordResetTokenRepository.save(resetToken);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(account.getEmail());
        message.setSubject("Reset your BaseCamp password");
        message.setText("Use this link to reset your BaseCamp password. It expires in 30 minutes:\n\n"
                + passwordResetUrl + "?token=" + rawToken + "\n\n"
                + "If you did not request this, you can ignore this email.");
        try {
            mailSender.send(message);
        } catch (MailException exception) {
            // Keep the response indistinguishable from an unknown email. The
            // token remains stored for observability/retry, but is never
            // returned to the client.
            log.error("Could not send password reset email for account {}", account.getId(), exception);
        }
    }

}
