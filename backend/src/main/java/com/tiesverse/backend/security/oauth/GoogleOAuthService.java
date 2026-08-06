package com.tiesverse.backend.security.oauth;

import com.tiesverse.backend.auth.entity.Account;
import com.tiesverse.backend.auth.repository.AccountRepository;
import com.tiesverse.backend.common.enums.AuthProvider;
import com.tiesverse.backend.common.enums.Role;
import com.tiesverse.backend.user.entity.User;
import com.tiesverse.backend.user.entity.UserSettings;
import com.tiesverse.backend.user.repository.UserRepository;
import com.tiesverse.backend.user.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Finds the account behind a Google sign-in, linking the Google id onto a
     * matching local account on first use (so someone who registered with
     * email/password can also sign in with the same Google email), or
     * provisioning a brand-new account when neither exists.
     */
    @Transactional
    public Account findOrCreateAccount(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        String googleId = oAuth2User.getAttribute("sub");
        String name = oAuth2User.getAttribute("name");

        return accountRepository.findByGoogleId(googleId)
                .or(() -> accountRepository.findByEmail(email))
                .map(existing -> linkGoogleId(existing, googleId))
                .orElseGet(() -> createAccount(email, googleId, name));
    }

    private Account linkGoogleId(Account account, String googleId) {
        if (account.getGoogleId() == null) {
            account.setGoogleId(googleId);
            return accountRepository.save(account);
        }
        return account;
    }

    private Account createAccount(String email, String googleId, String fullName) {
        // Accounts require a password even for Google-only sign-in (the column
        // is NOT NULL); this hash is never used to authenticate since Google
        // accounts never go through the password login endpoint.
        Account account = Account.builder()
                .email(email)
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .role(Role.PUBLIC_USER)
                .authProvider(AuthProvider.GOOGLE)
                .googleId(googleId)
                .emailVerified(true)
                .build();
        Account savedAccount = accountRepository.save(account);

        User savedUser = userRepository.save(User.builder()
                .fullName(fullName != null ? fullName : email)
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

        return savedAccount;
    }
}
