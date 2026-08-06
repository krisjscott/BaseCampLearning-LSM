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
public class ReorderModulesRequest {
    private java.util.List<ModuleOrderItem> modules;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ModuleOrderItem {
        private String id;
        private Integer orderIndex;
    }
}