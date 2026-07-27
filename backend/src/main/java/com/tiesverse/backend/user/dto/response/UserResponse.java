package com.tiesverse.backend.user.dto.response;

import com.tiesverse.backend.common.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.util.Date;
import java.util.UUID;

@Data
@Builder
public class UserResponse {

    private UUID id;
    private String fullName;
    private String email;
    private String profilePictureUrl;
    private String phone;
    private String bio;
    private Role role;
    private Date dateOfBirth;
}
