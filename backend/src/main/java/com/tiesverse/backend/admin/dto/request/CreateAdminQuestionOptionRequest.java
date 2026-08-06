package com.tiesverse.backend.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateAdminQuestionOptionRequest {
    @NotBlank(message = "Option text is required")
    private String optionText;

    @NotNull(message = "Correct flag is required")
    private Boolean correct;

    private Integer orderIndex;
}