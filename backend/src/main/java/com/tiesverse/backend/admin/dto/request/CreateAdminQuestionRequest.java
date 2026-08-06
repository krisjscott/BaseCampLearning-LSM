package com.tiesverse.backend.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAdminQuestionRequest {
    @NotBlank(message = "Question text is required")
    private String questionText;

    @NotNull(message = "Question type is required")
    private String questionType;

    @PositiveOrZero(message = "Points must be non-negative")
    private Integer points;

    @NotNull(message = "Order index is required")
    private Integer orderIndex;

    @Size(min = 2, message = "At least 2 options required for multiple choice")
    private List<CreateAdminQuestionOptionRequest> options;
}