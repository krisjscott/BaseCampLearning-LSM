package com.tiesverse.backend.certificate.service;

public record CertificateDownload(byte[] pdfBytes, String filename) {
}
