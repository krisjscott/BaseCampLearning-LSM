package com.tiesverse.backend.auth.dto.response;

import com.tiesverse.backend.common.enums.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private String email;
    private Role role;
    private String fullName;
    private boolean mfaRequired;
    private boolean emailVerificationRequired;
}
