package com.tiesverse.backend.security.oauth;

import com.tiesverse.backend.auth.dto.response.AuthResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OAuthExchangeResponse {
    private AuthResponse auth;
    private boolean newUser;
}
