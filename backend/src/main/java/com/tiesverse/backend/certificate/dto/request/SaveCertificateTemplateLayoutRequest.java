package com.tiesverse.backend.certificate.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SaveCertificateTemplateLayoutRequest {

    @NotNull
    @Valid
    private List<CertificateTemplateElementDto> elements;
}
