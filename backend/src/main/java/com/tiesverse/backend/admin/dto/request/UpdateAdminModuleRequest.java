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
public class UpdateAdminModuleRequest {
    private String title;
    private String description;
    private Integer orderIndex;
}
