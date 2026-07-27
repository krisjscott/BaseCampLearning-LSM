package com.tiesverse.backend.user.dto.request;

import lombok.Data;

@Data
public class UpdateSettingsRequest {

    private boolean emailNotifications;
    private boolean pushNotifications;
    private String language;
    private String timezone;
}
