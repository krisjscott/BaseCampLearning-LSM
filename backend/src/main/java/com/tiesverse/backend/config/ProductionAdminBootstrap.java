package com.tiesverse.backend.config;

import com.tiesverse.backend.auth.entity.Account;
import com.tiesverse.backend.auth.repository.AccountRepository;
import com.tiesverse.backend.common.enums.AuthProvider;
import com.tiesverse.backend.common.enums.Role;
import com.tiesverse.backend.user.entity.User;
import com.tiesverse.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

@Component
@Profile({"prod", "cloud"})
@RequiredArgsConstructor
public class ProductionAdminBootstrap implements ApplicationRunner {
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap-admin.email:}")
    private String email;
    @Value("${app.bootstrap-admin.password:}")
    private String password;
    @Value("${app.bootstrap-admin.full-name:Platform Administrator}")
    private String fullName;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (email.isBlank() && password.isBlank()) return;
        Assert.hasText(email, "app.bootstrap-admin.email must be set");
        Assert.hasText(password, "app.bootstrap-admin.password must be set");
        Assert.isTrue(password.length() >= 12, "app.bootstrap-admin.password must be at least 12 characters");
        String normalizedEmail = email.trim().toLowerCase();
        if (accountRepository.existsByEmail(normalizedEmail)) return;

        Account account = accountRepository.save(Account.builder()
                .email(normalizedEmail).password(passwordEncoder.encode(password))
                .role(Role.SUPER_ADMIN).authProvider(AuthProvider.LOCAL)
                .emailVerified(true).active(true).build());
        User user = userRepository.save(User.builder().fullName(fullName).accountId(account.getId()).build());
        account.setUserId(user.getId());
        accountRepository.save(account);
    }
}
