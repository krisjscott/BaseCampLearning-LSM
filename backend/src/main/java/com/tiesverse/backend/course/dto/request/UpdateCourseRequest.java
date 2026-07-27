package com.tiesverse.backend.course.dto.request;

import com.tiesverse.backend.common.enums.CourseVisibility;
import lombok.Data;

@Data
public class UpdateCourseRequest {

    private String title;

    private String description;

    private String thumbnailUrl;

    private CourseVisibility visibility;

    private Integer durationHours;

    private Double price;
}
