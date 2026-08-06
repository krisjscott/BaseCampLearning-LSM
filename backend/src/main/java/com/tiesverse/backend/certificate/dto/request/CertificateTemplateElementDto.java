package com.tiesverse.backend.certificate.dto.request;

import com.tiesverse.backend.common.enums.CertificateElementType;
import com.tiesverse.backend.common.enums.TextAlign;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CertificateTemplateElementDto {

    @NotNull
    private CertificateElementType elementType;

    private String content;

    @NotNull
    private Double x;

    @NotNull
    private Double y;

    @NotNull
    private Double width;

    @NotNull
    private Double height;

    private String fontFamily;
    private Double fontSize;
    private String fontColor;
    private Boolean bold;
    private TextAlign textAlign;
    private Integer orderIndex;
}
