package com.tiesverse.backend.certificate.service;

import java.util.UUID;

public interface CertificateIssuanceService {

    /**
     * Issues a certificate for the given user/course if none exists yet and a certificate
     * template is configured for the course. No-op otherwise — never throws for the "not
     * eligible yet" cases, since this is called from inside the course-completion save path.
     */
    void issueIfEligible(UUID userId, UUID courseId);
}
