package com.tiesverse.backend.assessment.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateOptionRequest {

    @NotBlank
    private String optionText;

    private boolean correct;
}
