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
import com.tiesverse.backend.auth.entity.Account;
import com.tiesverse.backend.auth.mapper.AuthMapper;
import com.tiesverse.backend.auth.repository.AccountRepository;
import com.tiesverse.backend.common.enums.AuthProvider;
import com.tiesverse.backend.common.enums.Role;
import com.tiesverse.backend.common.exception.UnauthorizedException;
import com.tiesverse.backend.security.jwt.JwtProvider;
import com.tiesverse.backend.security.turnstile.TurnstileService;
import com.tiesverse.backend.user.entity.User;
import com.tiesverse.backend.user.entity.UserSettings;
import com.tiesverse.backend.user.repository.UserRepository;
import com.tiesverse.backend.user.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;
    private final TurnstileService turnstileService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        turnstileService.verify(request.getTurnstileToken());

        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        Account account = Account.builder()
                .email(request.getEmail())
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
    public void forgotPassword(ForgotPasswordRequest request) {
        turnstileService.verify(request.getTurnstileToken());

        accountRepository.findByEmail(request.getEmail());
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        throw new RuntimeException("Not implemented");
    }

    @Override
    public void verifyEmail(VerifyEmailRequest request) {
        throw new RuntimeException("Not implemented");
    }

    @Override
    public void verifyOtp(OtpRequest request) {
        throw new RuntimeException("Not implemented");
    }
}
