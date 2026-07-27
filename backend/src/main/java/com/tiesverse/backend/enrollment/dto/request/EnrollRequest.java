package com.tiesverse.backend.enrollment.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class EnrollRequest {

    @NotNull
    private UUID userId;

    @NotNull
    private UUID courseId;

    private LocalDate dueDate;
}
