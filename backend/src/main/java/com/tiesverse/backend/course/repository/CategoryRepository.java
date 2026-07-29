package com.tiesverse.backend.course.repository;

import com.tiesverse.backend.course.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    Optional<Category> findByName(String name);

    List<Category> findByParentIdIsNull();

    List<Category> findByParentId(UUID parentId);
}
