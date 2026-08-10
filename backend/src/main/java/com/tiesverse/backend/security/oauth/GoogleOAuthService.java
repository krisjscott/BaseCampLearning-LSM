package com.tiesverse.backend.security.oauth;

import com.tiesverse.backend.auth.dto.response.AuthResponse;
import com.tiesverse.backend.auth.entity.Account;
import com.tiesverse.backend.auth.repository.AccountRepository;
import com.tiesverse.backend.common.enums.AuthProvider;
import com.tiesverse.backend.common.enums.Role;
import com.tiesverse.backend.common.util.TokenHashUtil;
import com.tiesverse.backend.security.jwt.JwtProvider;
import com.tiesverse.backend.user.entity.User;
import com.tiesverse.backend.user.entity.UserSettings;
import com.tiesverse.backend.user.repository.UserRepository;
import com.tiesverse.backend.user.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;

    /**
     * Finds or creates the account behind a Google sign-in - links the Google
     * id onto a matching local account on first use (so someone who
     * registered with email/password can also sign in with the same Google
     * email), and reports whether this was a brand-new account so the caller
     * can route new sign-ups to onboarding, matching the register endpoint.
     */
    @Transactional
    public GoogleAuthentication authenticate(String googleId, String email, String fullName, String pictureUrl,
                                             String phoneNumber) {
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
                        .emailVerified(false)
                        .build();
                account = accountRepository.save(account);

                User user = userRepository.save(User.builder()
                        .fullName(fullName != null ? fullName : email)
                        .profilePictureUrl(pictureUrl)
                        .phone(phoneNumber)
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
                if (account.getUserId() != null && phoneNumber != null && !phoneNumber.isBlank()) {
                    userRepository.findById(account.getUserId()).ifPresent(user -> {
                        if (user.getPhone() == null || user.getPhone().isBlank()) {
                            user.setPhone(phoneNumber);
                            userRepository.save(user);
                        }
                    });
                }
            }
        }

        if (!account.isActive()) {
            throw new IllegalStateException("This account has been deactivated");
        }

        String resolvedName = userRepository.findById(account.getUserId())
                .map(User::getFullName)
                .orElse(fullName);

        return new GoogleAuthentication(account.getId(), account.getEmail(), account.getRole(), resolvedName, newUser);
    }

    public AuthResponse issueAuth(UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalStateException("Account not found"));
        if (!account.isActive()) {
            throw new IllegalStateException("This account has been deactivated");
        }
        String accessToken = jwtProvider.generateToken(account.getEmail(), java.util.Map.of("role", account.getRole().name()));
        String refreshToken = jwtProvider.generateRefreshToken(account.getEmail());
        account.setRefreshToken(TokenHashUtil.sha256Hex(refreshToken));
        accountRepository.save(account);
        String fullName = userRepository.findById(account.getUserId()).map(User::getFullName).orElse(account.getEmail());
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(account.getEmail())
                .role(account.getRole())
                .fullName(fullName)
                .build();
    }

    public record GoogleAuthentication(UUID accountId, String email, Role role, String fullName, boolean newUser) {
    }
}
