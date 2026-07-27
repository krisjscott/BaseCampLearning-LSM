package com.tiesverse.backend.analytics.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class CourseCompletionReport {

    private UUID courseId;
    private String courseTitle;
    private long totalEnrolled;
    private long completed;
    private Double completionRate;
}
