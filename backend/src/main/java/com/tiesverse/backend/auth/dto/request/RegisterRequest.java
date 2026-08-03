package com.tiesverse.backend.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 8)
    private String password;

    private String fullName;

    private String turnstileToken;
}
