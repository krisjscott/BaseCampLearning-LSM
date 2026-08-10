package com.tiesverse.backend.auth.entity;

import com.tiesverse.backend.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "otps")
@Getter
@Setter
@NoArgsConstructor
public class Otp extends BaseEntity {

    @Column(name = "account_id")
    private UUID accountId;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "otp_code", nullable = false, length = 10)
    private String otpCode;

    @Column(name = "type", nullable = false, length = 50)
    private String type;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "used_at")
    private LocalDateTime usedAt;
}
