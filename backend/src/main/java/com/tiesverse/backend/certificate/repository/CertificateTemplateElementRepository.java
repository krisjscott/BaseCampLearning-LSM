package com.tiesverse.backend.certificate.repository;

import com.tiesverse.backend.certificate.entity.CertificateTemplateElement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CertificateTemplateElementRepository extends JpaRepository<CertificateTemplateElement, UUID> {

    List<CertificateTemplateElement> findByTemplateIdOrderByOrderIndexAsc(UUID templateId);

    void deleteByTemplateId(UUID templateId);
}
