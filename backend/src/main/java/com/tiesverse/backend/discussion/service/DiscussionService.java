package com.tiesverse.backend.discussion.service;

import com.tiesverse.backend.discussion.dto.request.CreateDiscussionPostRequest;
import com.tiesverse.backend.discussion.dto.response.DiscussionPostResponse;

import java.util.List;
import java.util.UUID;

public interface DiscussionService {

    List<DiscussionPostResponse> getPostsForCourse(UUID courseId);

    DiscussionPostResponse createPost(UUID userId, CreateDiscussionPostRequest request);

    void deletePost(UUID userId, boolean isAdmin, UUID postId);
}
