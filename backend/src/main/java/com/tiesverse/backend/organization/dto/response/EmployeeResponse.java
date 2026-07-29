package com.tiesverse.backend.organization.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class EmployeeResponse {

    private UUID id;

    private UUID userId;

    private String fullName;

    private String employeeCode;

    private String jobTitle;

    private String departmentName;

    private String teamName;

    private boolean active;
}
