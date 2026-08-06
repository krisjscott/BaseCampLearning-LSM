package com.tiesverse.backend.discussion.repository;

import com.tiesverse.backend.discussion.entity.DiscussionPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DiscussionPostRepository extends JpaRepository<DiscussionPost, UUID> {

    List<DiscussionPost> findByCourseIdOrderByCreatedAtAsc(UUID courseId);

    void deleteByParentId(UUID parentId);
}
