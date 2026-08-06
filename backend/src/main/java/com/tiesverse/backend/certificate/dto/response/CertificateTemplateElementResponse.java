package com.tiesverse.backend.certificate.dto.response;

import com.tiesverse.backend.common.enums.CertificateElementType;
import com.tiesverse.backend.common.enums.TextAlign;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class CertificateTemplateElementResponse {

    private UUID id;
    private CertificateElementType elementType;
    private String content;
    private Double x;
    private Double y;
    private Double width;
    private Double height;
    private String fontFamily;
    private Double fontSize;
    private String fontColor;
    private Boolean bold;
    private TextAlign textAlign;
    private Integer orderIndex;
}
