package com.tiesverse.backend.user.controller;

import com.tiesverse.backend.common.response.ApiResponse;
import com.tiesverse.backend.user.dto.request.UpdateProfileRequest;
import com.tiesverse.backend.user.dto.request.UpdateSettingsRequest;
import com.tiesverse.backend.user.dto.response.UserActivityResponse;
import com.tiesverse.backend.user.dto.response.UserResponse;
import com.tiesverse.backend.user.entity.UserSettings;
import com.tiesverse.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(@RequestParam UUID accountId) {
        UserResponse response = userService.getProfile(accountId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @RequestParam UUID accountId,
            @RequestBody UpdateProfileRequest request) {
        UserResponse response = userService.updateProfile(accountId, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @GetMapping("/me/settings")
    public ResponseEntity<ApiResponse<UserSettings>> getSettings(@RequestParam UUID accountId) {
        UserSettings response = userService.getSettings(accountId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me/settings")
    public ResponseEntity<ApiResponse<UserSettings>> updateSettings(
            @RequestParam UUID accountId,
            @RequestBody UpdateSettingsRequest request) {
        UserSettings response = userService.updateSettings(accountId, request);
        return ResponseEntity.ok(ApiResponse.success("Settings updated successfully", response));
    }

    @GetMapping("/me/activities")
    public ResponseEntity<ApiResponse<List<UserActivityResponse>>> getActivities(@RequestParam UUID userId) {
        List<UserActivityResponse> response = userService.getActivities(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me/profile-picture")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfilePicture(
            @RequestParam UUID accountId,
            @RequestParam String url) {
        UserResponse response = userService.updateProfilePicture(accountId, url);
        return ResponseEntity.ok(ApiResponse.success("Profile picture updated successfully", response));
    }
}
