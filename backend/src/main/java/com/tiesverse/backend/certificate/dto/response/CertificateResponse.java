package com.tiesverse.backend.certificate.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class CertificateResponse {

    private UUID id;
    private String certificateNumber;
    private String title;
    private String recipientName;
    private String courseName;
    private String issuerName;
    private LocalDate issuedDate;
    private String fileUrl;
}
