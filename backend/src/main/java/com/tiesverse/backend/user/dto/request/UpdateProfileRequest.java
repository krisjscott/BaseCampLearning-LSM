package com.tiesverse.backend.user.dto.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateProfileRequest {

    private String fullName;
    private String phone;
    private String bio;
    private LocalDate dateOfBirth;
    private String address;
}
