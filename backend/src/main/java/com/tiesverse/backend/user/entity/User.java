package com.tiesverse.backend.user.entity;

import com.tiesverse.backend.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Column(name = "learner_code", insertable = false, updatable = false)
    private String learnerCode;

    @Column
    private String phone;

    @Column
    private String bio;

    @Column(name = "account_id")
    private UUID accountId;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column
    private String address;
}
