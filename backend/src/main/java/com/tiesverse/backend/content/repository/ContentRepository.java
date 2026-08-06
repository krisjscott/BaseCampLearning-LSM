package com.tiesverse.backend.content.repository;

import com.tiesverse.backend.content.entity.Content;
import com.tiesverse.backend.common.enums.ContentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContentRepository extends JpaRepository<Content, UUID> {

    List<Content> findByCourseId(UUID courseId);

    List<Content> findByContentType(ContentType contentType);

    List<Content> findByUploadedById(UUID uploadedById);

    void deleteByCourseId(UUID courseId);
}
