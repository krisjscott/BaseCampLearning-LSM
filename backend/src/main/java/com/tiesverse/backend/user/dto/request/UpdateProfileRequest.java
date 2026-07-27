package com.tiesverse.backend.user.dto.request;

import lombok.Data;

import java.util.Date;

@Data
public class UpdateProfileRequest {

    private String fullName;
    private String phone;
    private String bio;
    private Date dateOfBirth;
    private String address;
}
