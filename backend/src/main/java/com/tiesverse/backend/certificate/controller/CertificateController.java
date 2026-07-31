package com.tiesverse.backend.certificate.controller;

import com.tiesverse.backend.certificate.dto.response.CertificateResponse;
import com.tiesverse.backend.certificate.service.CertificateService;
import com.tiesverse.backend.common.response.ApiResponse;
import com.tiesverse.backend.auth.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;
    private final AccountRepository accountRepository;

    @GetMapping("/my-certificates")
    public ResponseEntity<ApiResponse<List<CertificateResponse>>> getMyCertificates(Principal principal) {
        List<CertificateResponse> certificates = certificateService.getUserCertificates(currentUserId(principal));
        return ResponseEntity.ok(ApiResponse.success(certificates));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CertificateResponse>> getCertificate(@PathVariable UUID id) {
        String fileUrl = certificateService.downloadCertificate(id);
        CertificateResponse response = CertificateResponse.builder().fileUrl(fileUrl).build();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/verify/{certificateNumber}")
    public ResponseEntity<ApiResponse<CertificateResponse>> verifyCertificate(@PathVariable String certificateNumber) {
        CertificateResponse response = certificateService.getCertificateByNumber(certificateNumber);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<ApiResponse<String>> downloadCertificate(@PathVariable UUID id) {
        String fileUrl = certificateService.downloadCertificate(id);
        return ResponseEntity.ok(ApiResponse.success(fileUrl));
    }

    private UUID currentUserId(Principal principal) {
        return accountRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Account not found"))
                .getUserId();
    }
}
