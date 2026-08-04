package com.tiesverse.backend.user.controller;

import com.tiesverse.backend.common.response.ApiResponse;
import com.tiesverse.backend.user.dto.request.UpdateProfileRequest;
import com.tiesverse.backend.user.dto.request.UpdateSettingsRequest;
import com.tiesverse.backend.user.dto.response.UserActivityResponse;
import com.tiesverse.backend.user.dto.response.UserResponse;
import com.tiesverse.backend.user.entity.UserSettings;
import com.tiesverse.backend.user.service.UserService;
import com.tiesverse.backend.security.AuthContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuthContext authContext;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(Principal principal) {
        UserResponse response = userService.getProfile(authContext.currentAccount(principal).getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            Principal principal,
            @RequestBody UpdateProfileRequest request) {
        UserResponse response = userService.updateProfile(authContext.currentAccount(principal).getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @GetMapping("/me/settings")
    public ResponseEntity<ApiResponse<UserSettings>> getSettings(Principal principal) {
        UserSettings response = userService.getSettings(authContext.currentAccount(principal).getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me/settings")
    public ResponseEntity<ApiResponse<UserSettings>> updateSettings(
            Principal principal,
            @RequestBody UpdateSettingsRequest request) {
        UserSettings response = userService.updateSettings(authContext.currentAccount(principal).getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Settings updated successfully", response));
    }

    @GetMapping("/me/activities")
    public ResponseEntity<ApiResponse<List<UserActivityResponse>>> getActivities(Principal principal, @RequestParam UUID userId) {
        authContext.requireSelfOrAdmin(principal, userId);
        List<UserActivityResponse> response = userService.getActivities(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me/profile-picture")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfilePicture(
            Principal principal,
            @RequestParam String url) {
        UserResponse response = userService.updateProfilePicture(authContext.currentAccount(principal).getId(), url);
        return ResponseEntity.ok(ApiResponse.success("Profile picture updated successfully", response));
    }
}
