package com.tiesverse.backend.organization.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SSOConfigRequest {

    @NotBlank
    private String ssoProvider;

    @NotBlank
    private String ssoClientId;

    @NotBlank
    private String ssoClientSecret;
}
