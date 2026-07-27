package com.tiesverse.backend.user.repository;

import com.tiesverse.backend.user.entity.UserActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, UUID> {

    List<UserActivity> findByUserIdOrderByActivityDateDesc(UUID userId);
}
