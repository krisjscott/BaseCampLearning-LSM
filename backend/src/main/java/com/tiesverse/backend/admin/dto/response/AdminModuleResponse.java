package com.tiesverse.backend.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminModuleResponse {
    private String id;
    private String title;
    private String description;
    private Integer orderIndex;
    private String courseId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<AdminLessonResponse> lessons;
}