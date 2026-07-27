package com.tiesverse.backend.enrollment.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class AssignCourseRequest {

    @NotNull
    private UUID userId;

    @NotNull
    private UUID courseId;

    @NotNull
    private UUID assignedById;

    private LocalDate dueDate;
}
