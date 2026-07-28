package com.tiesverse.backend.certificate.mapper;

import com.tiesverse.backend.certificate.dto.response.CertificateResponse;
import com.tiesverse.backend.certificate.entity.Certificate;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface CertificateMapper {

    CertificateMapper INSTANCE = Mappers.getMapper(CertificateMapper.class);

    CertificateResponse toResponse(Certificate certificate);
}
