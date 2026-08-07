package com.tiesverse.backend.auth.service;

import com.tiesverse.backend.auth.dto.request.ForgotPasswordRequest;
import com.tiesverse.backend.auth.dto.request.ChangePasswordRequest;
import com.tiesverse.backend.auth.dto.request.LoginRequest;
import com.tiesverse.backend.auth.dto.request.OtpRequest;
import com.tiesverse.backend.auth.dto.request.RefreshTokenRequest;
import com.tiesverse.backend.auth.dto.request.RegisterRequest;
import com.tiesverse.backend.auth.dto.request.ResetPasswordRequest;
import com.tiesverse.backend.auth.dto.request.VerifyEmailRequest;
import com.tiesverse.backend.auth.dto.response.AuthResponse;
import com.tiesverse.backend.auth.dto.response.TokenResponse;
import com.tiesverse.backend.auth.entity.Account;
import com.tiesverse.backend.auth.entity.PasswordResetToken;
import com.tiesverse.backend.auth.mapper.AuthMapper;
import com.tiesverse.backend.auth.repository.AccountRepository;
import com.tiesverse.backend.auth.repository.PasswordResetTokenRepository;
import com.tiesverse.backend.common.enums.AuthProvider;
import com.tiesverse.backend.common.enums.Role;
import com.tiesverse.backend.common.exception.ConflictException;
import com.tiesverse.backend.common.exception.UnauthorizedException;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private static final int RESET_TOKEN_BYTES = 32;
    private static final int RESET_TOKEN_MINUTES = 30;

    private final AccountRepository accountRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;
    private final TurnstileService turnstileService;
    private final JavaMailSender mailSender;

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

        String accessToken = jwtProvider.generateToken(
                savedAccount.getEmail(),
                Map.of("role", savedAccount.getRole().name())
        );
        String refreshToken = jwtProvider.generateRefreshToken(savedAccount.getEmail());

        savedAccount.setRefreshToken(refreshToken);
        accountRepository.save(savedAccount);

        return AuthMapper.INSTANCE.toAuthResponse(savedAccount, accessToken, refreshToken, request.getFullName());
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        turnstileService.verify(request.getTurnstileToken());

        Account account = accountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), account.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!account.isActive()) {
            throw new UnauthorizedException("This account has been deactivated");
        }

        String accessToken = jwtProvider.generateToken(
                account.getEmail(),
                Map.of("role", account.getRole().name())
        );
        String refreshToken = jwtProvider.generateRefreshToken(account.getEmail());

        account.setRefreshToken(refreshToken);
        accountRepository.save(account);

        return AuthMapper.INSTANCE.toAuthResponse(account, accessToken, refreshToken, null);
    }

    @Override
    public TokenResponse refreshToken(RefreshTokenRequest request) {
        Account account = accountRepository.findByRefreshToken(request.getRefreshToken())
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

        account.setRefreshToken(newRefreshToken);
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
                .findByTokenHashAndUsedAtIsNull(hashToken(request.getToken()))
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
    public void verifyOtp(OtpRequest request) {
        throw new RuntimeException("Not implemented");
    }

    private void createAndSendResetToken(Account account) {
        passwordResetTokenRepository.deleteByAccountIdAndUsedAtIsNull(account.getId());

        byte[] bytes = new byte[RESET_TOKEN_BYTES];
        new SecureRandom().nextBytes(bytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setAccountId(account.getId());
        resetToken.setTokenHash(hashToken(rawToken));
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

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
