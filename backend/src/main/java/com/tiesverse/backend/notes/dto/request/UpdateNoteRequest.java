package com.tiesverse.backend.notes.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateNoteRequest {

    @NotBlank(message = "Content is required")
    private String content;
}
