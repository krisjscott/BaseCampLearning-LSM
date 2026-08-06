package com.tiesverse.backend.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminCourseListResponse {
    private String id;
    private String title;
    private String description;
    private String thumbnailUrl;
    private String instructorName;
    private String categoryName;
    private String visibility;
    private String status;
    private Integer durationHours;
    private Double price;
    private BigDecimal rating;
    private Integer totalEnrollments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}