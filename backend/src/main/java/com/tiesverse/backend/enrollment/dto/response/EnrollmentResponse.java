package com.tiesverse.backend.enrollment.dto.response;

import com.tiesverse.backend.common.enums.EnrollmentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class EnrollmentResponse {

    private UUID id;
    private UUID userId;
    private String userName;
    private UUID courseId;
    private String courseTitle;
    private String courseThumbnail;
    private EnrollmentStatus status;
    private LocalDate dueDate;
    private LocalDate enrolledDate;
    private LocalDate completedDate;
}
