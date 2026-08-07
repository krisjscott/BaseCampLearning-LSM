package com.tiesverse.backend.user.repository;

import com.tiesverse.backend.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByAccountId(UUID accountId);

    Page<User> findByFullNameContainingIgnoreCase(String name, Pageable pageable);

    Page<User> findByIdIn(Collection<UUID> ids, Pageable pageable);

    Page<User> findByIdInAndFullNameContainingIgnoreCase(Collection<UUID> ids, String name, Pageable pageable);
}
