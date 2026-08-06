package com.tiesverse.backend.admin.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReorderLessonsRequest {
    private java.util.List<LessonOrderItem> lessons;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LessonOrderItem {
        private String id;
        private Integer orderIndex;
    }
}