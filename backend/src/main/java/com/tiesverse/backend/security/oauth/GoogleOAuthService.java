package com.tiesverse.backend.security.oauth;

import com.tiesverse.backend.auth.dto.response.AuthResponse;
import com.tiesverse.backend.auth.entity.Account;
import com.tiesverse.backend.auth.repository.AccountRepository;
import com.tiesverse.backend.common.enums.AuthProvider;
import com.tiesverse.backend.common.enums.Role;
import com.tiesverse.backend.security.jwt.JwtProvider;
import com.tiesverse.backend.user.entity.User;
import com.tiesverse.backend.user.entity.UserSettings;
import com.tiesverse.backend.user.repository.UserRepository;
import com.tiesverse.backend.user.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class GoogleOAuthService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;

    public GoogleOAuthService(AccountRepository accountRepository,
                              UserRepository userRepository,
                              UserSettingsRepository userSettingsRepository,
                              JwtProvider jwtProvider,
                              @Lazy PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.userSettingsRepository = userSettingsRepository;
        this.jwtProvider=jwtProvider;
        this.passwordEncoder=passwordEncoder;

    }

    @Transactional
    public GoogleAuthentication authenticate(String googleId, String email, String fullName, String pictureUrl) {
        Account account = accountRepository.findByGoogleId(googleId).orElse(null);
        boolean newUser = false;

        if (account == null) {
            account = accountRepository.findByEmail(email).orElse(null);
            if (account == null) {
                account = Account.builder()
                        .email(email)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .role(Role.PUBLIC_USER)
                        .authProvider(AuthProvider.GOOGLE)
                        .googleId(googleId)
                        .emailVerified(true)
                        .build();
                account = accountRepository.save(account);

                User user = userRepository.save(User.builder()
                        .fullName(fullName)
                        .profilePictureUrl(pictureUrl)
                        .accountId(account.getId())
                        .build());
                account.setUserId(user.getId());
                userSettingsRepository.save(UserSettings.builder()
                        .userId(user.getId())
                        .emailNotifications(true)
                        .pushNotifications(true)
                        .language("en")
                        .timezone("Asia/Kolkata")
                        .build());
                newUser = true;
            } else {
                account.setGoogleId(googleId);
                account.setEmailVerified(true);
            }
        }

        if (!account.isActive()) {
            throw new IllegalStateException("This account has been deactivated");
        }

        String accessToken = jwtProvider.generateToken(account.getEmail(), Map.of("role", account.getRole().name()));
        String refreshToken = jwtProvider.generateRefreshToken(account.getEmail());
        account.setRefreshToken(refreshToken);
        accountRepository.save(account);

        String resolvedName = userRepository.findById(account.getUserId())
                .map(User::getFullName)
                .orElse(fullName);
        return new GoogleAuthentication(AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(account.getEmail())
                .role(account.getRole())
                .fullName(resolvedName)
                .build(), newUser);
    }

    public record GoogleAuthentication(AuthResponse auth, boolean newUser) {
    }
}
