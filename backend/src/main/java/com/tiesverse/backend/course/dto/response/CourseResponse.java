package com.tiesverse.backend.course.dto.response;

import com.tiesverse.backend.common.enums.CourseStatus;
import com.tiesverse.backend.common.enums.CourseVisibility;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class CourseResponse {

    private UUID id;

    private String title;

    private String description;

    private String thumbnailUrl;

    private String instructorName;

    private String categoryName;

    private CourseVisibility visibility;

    private CourseStatus status;

    private Integer durationHours;

    private Double price;

    private BigDecimal rating;

    private Integer totalEnrollments;

    private LocalDateTime createdAt;
}
