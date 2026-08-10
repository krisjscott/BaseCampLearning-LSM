package com.tiesverse.backend.security.oauth;

import com.tiesverse.backend.auth.dto.response.AuthResponse;
import com.tiesverse.backend.auth.entity.Account;
import com.tiesverse.backend.auth.repository.AccountRepository;
import com.tiesverse.backend.auth.service.OtpService;
import com.tiesverse.backend.common.exception.UnauthorizedException;
import com.tiesverse.backend.user.entity.User;
import com.tiesverse.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class OAuthExchangeService {

    private static final int CODE_BYTES = 32;
    private static final int CODE_MINUTES = 2;

    private final OAuthExchangeCodeRepository codeRepository;
    private final GoogleOAuthService googleOAuthService;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final OtpService otpService;

    @Transactional
    public String createCode(GoogleOAuthService.GoogleAuthentication authentication) {
        codeRepository.deleteByAccountIdAndUsedAtIsNull(authentication.accountId());

        byte[] bytes = new byte[CODE_BYTES];
        new SecureRandom().nextBytes(bytes);
        String rawCode = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        OAuthExchangeCode code = new OAuthExchangeCode();
        code.setAccountId(authentication.accountId());
        code.setCodeHash(hash(rawCode));
        code.setExpiresAt(LocalDateTime.now().plusMinutes(CODE_MINUTES));
        code.setNewUser(authentication.newUser());
        codeRepository.save(code);
        return rawCode;
    }

    @Transactional
    public OAuthExchangeResponse exchange(String rawCode) {
        OAuthExchangeCode code = codeRepository.findByCodeHashAndUsedAtIsNull(hash(rawCode))
                .orElseThrow(() -> new UnauthorizedException("Google sign-in code is invalid or expired"));
        if (code.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Google sign-in code is invalid or expired");
        }

        code.setUsedAt(LocalDateTime.now());
        codeRepository.save(code);

        Account account = accountRepository.findById(code.getAccountId())
                .orElseThrow(() -> new UnauthorizedException("Account not found"));

        if (!account.isActive()) {
            throw new UnauthorizedException("This account has been deactivated");
        }

        String fullName = userRepository.findById(account.getUserId())
                .map(User::getFullName)
                .orElse(account.getEmail());

        AuthResponse authResponse;
        if (!account.isEmailVerified()) {
            otpService.sendOtp(account.getEmail(), account.getId(), "EMAIL_VERIFICATION");
            authResponse = AuthResponse.builder()
                    .email(account.getEmail())
                    .fullName(fullName)
                    .role(account.getRole())
                    .emailVerificationRequired(true)
                    .build();
        } else {
            otpService.sendOtp(account.getEmail(), account.getId(), "LOGIN_MFA");
            authResponse = AuthResponse.builder()
                    .email(account.getEmail())
                    .fullName(fullName)
                    .role(account.getRole())
                    .mfaRequired(true)
                    .build();
        }

        return new OAuthExchangeResponse(authResponse, code.isNewUser());
    }

    private String hash(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
