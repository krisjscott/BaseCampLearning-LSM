package com.tiesverse.backend.common.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.ses.model.*;

import lombok.extern.slf4j.Slf4j;
import java.net.URI;

@Service
@Slf4j
public class SesEmailService {

    private final SesClient sesClient;
    private final String fromEmail;

    public SesEmailService(
            @Value("${aws.ses.access-key-id:}") String accessKeyId,
            @Value("${aws.ses.secret-access-key:}") String secretAccessKey,
            @Value("${aws.ses.region:us-east-1}") String region,
            @Value("${aws.ses.from-email:no-reply@tiesverse.com}") String fromEmail,
            @Value("${aws.ses.endpoint:}") String endpoint
    ) {
        this.fromEmail = fromEmail;
        if (accessKeyId != null && !accessKeyId.isBlank() && secretAccessKey != null && !secretAccessKey.isBlank()) {
            var builder = SesClient.builder()
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(accessKeyId, secretAccessKey)))
                    .region(Region.of(region));
            if (endpoint != null && !endpoint.isBlank()) {
                builder.endpointOverride(URI.create(endpoint));
            }
            this.sesClient = builder.build();
            log.info("AWS SES Client initialized successfully.");
        } else {
            this.sesClient = null;
            log.warn("AWS SES credentials not fully configured. Email sending will fallback to logging to console.");
        }
    }

    public void sendEmail(String toEmail, String subject, String body) {
        if (sesClient == null) {
            log.info("\n--------------------------------------------------\n" +
                     "[MOCK AWS SES EMAIL]\n" +
                     "To: {}\n" +
                     "Subject: {}\n" +
                     "Body: {}\n" +
                     "--------------------------------------------------", toEmail, subject, body);
            return;
        }

        try {
            SendEmailRequest request = SendEmailRequest.builder()
                    .destination(Destination.builder().toAddresses(toEmail).build())
                    .message(Message.builder()
                            .subject(Content.builder().data(subject).build())
                            .body(Body.builder()
                                    .text(Content.builder().data(body).build())
                                    .build())
                            .build())
                    .source(fromEmail)
                    .build();

            sesClient.sendEmail(request);
            log.info("Email sent successfully via AWS SES to {}", toEmail);
        } catch (SesException e) {
            log.error("Failed to send email via AWS SES to {}: {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("Email sending failed", e);
        }
    }
}
