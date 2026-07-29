package com.tiesverse.backend.assessment.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class OptionResponse {

    private UUID id;
    private String optionText;
}
