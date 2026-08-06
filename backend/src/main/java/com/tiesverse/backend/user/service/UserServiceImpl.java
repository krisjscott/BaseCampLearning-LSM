package com.tiesverse.backend.user.service;

import com.tiesverse.backend.auth.entity.Account;
import com.tiesverse.backend.auth.repository.AccountRepository;
import com.tiesverse.backend.user.dto.request.UpdateProfileRequest;
import com.tiesverse.backend.user.dto.request.UpdateSettingsRequest;
import com.tiesverse.backend.user.dto.response.UserActivityResponse;
import com.tiesverse.backend.user.dto.response.UserResponse;
import com.tiesverse.backend.user.entity.User;
import com.tiesverse.backend.user.entity.UserActivity;
import com.tiesverse.backend.user.entity.UserSettings;
import com.tiesverse.backend.user.mapper.UserMapper;
import com.tiesverse.backend.user.repository.UserActivityRepository;
import com.tiesverse.backend.user.repository.UserRepository;
import com.tiesverse.backend.user.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserActivityRepository userActivityRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final AccountRepository accountRepository;

    @Override
    public UserResponse getProfile(UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        User user = userRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserMapper.INSTANCE.toUserResponse(user, account.getEmail(), account.getRole().name());
    }

    @Override
    public UserResponse updateProfile(UUID accountId, UpdateProfileRequest request) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        User user = userRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserMapper.INSTANCE.updateUserFromRequest(request, user);
        User updatedUser = userRepository.save(user);

        return UserMapper.INSTANCE.toUserResponse(updatedUser, account.getEmail(), account.getRole().name());
    }

    @Override
    @Transactional
    public UserSettings getSettings(UUID accountId) {
        User user = userRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userSettingsRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultSettings(user.getId()));
    }

    @Override
    @Transactional
    public UserSettings updateSettings(UUID accountId, UpdateSettingsRequest request) {
        User user = userRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserSettings settings = userSettingsRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultSettings(user.getId()));

        settings.setEmailNotifications(request.isEmailNotifications());
        settings.setPushNotifications(request.isPushNotifications());
        settings.setLanguage(request.getLanguage());
        settings.setTimezone(request.getTimezone());

        return userSettingsRepository.save(settings);
    }

    // Accounts created before UserSettings rows were provisioned at
    // registration time (or any account whose row was otherwise never
    // created) used to hard-fail every settings read/write with a 500 -
    // self-heal by creating sane defaults on first access instead.
    private UserSettings createDefaultSettings(UUID userId) {
        return userSettingsRepository.save(UserSettings.builder()
                .userId(userId)
                .emailNotifications(true)
                .pushNotifications(true)
                .language("en")
                .timezone("Asia/Kolkata")
                .build());
    }

    @Override
    public List<UserActivityResponse> getActivities(UUID userId) {
        List<UserActivity> activities = userActivityRepository.findByUserIdOrderByActivityDateDesc(userId);
        return activities.stream()
                .map(UserMapper.INSTANCE::toUserActivityResponse)
                .toList();
    }

    @Override
    public UserResponse updateProfilePicture(UUID accountId, String url) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        User user = userRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setProfilePictureUrl(url);
        User updatedUser = userRepository.save(user);
        return UserMapper.INSTANCE.toUserResponse(updatedUser, account.getEmail(), account.getRole().name());
    }
}
