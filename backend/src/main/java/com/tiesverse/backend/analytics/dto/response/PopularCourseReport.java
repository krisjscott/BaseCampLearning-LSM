package com.tiesverse.backend.analytics.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class PopularCourseReport {

    private UUID courseId;
    private String courseTitle;
    private Integer totalEnrollments;
    private BigDecimal averageRating;
    private Long completionCount;
}
