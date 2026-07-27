package com.tiesverse.backend.user.service;

import com.tiesverse.backend.user.dto.request.UpdateProfileRequest;
import com.tiesverse.backend.user.dto.request.UpdateSettingsRequest;
import com.tiesverse.backend.user.dto.response.UserActivityResponse;
import com.tiesverse.backend.user.dto.response.UserResponse;
import com.tiesverse.backend.user.entity.UserSettings;

import java.util.List;
import java.util.UUID;

public interface UserService {

    UserResponse getProfile(UUID accountId);

    UserResponse updateProfile(UUID accountId, UpdateProfileRequest request);

    UserSettings getSettings(UUID accountId);

    UserSettings updateSettings(UUID accountId, UpdateSettingsRequest request);

    List<UserActivityResponse> getActivities(UUID userId);

    UserResponse updateProfilePicture(UUID accountId, String url);
}
