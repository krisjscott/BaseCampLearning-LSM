package com.tiesverse.backend.discussion.service;

import com.tiesverse.backend.common.exception.ForbiddenException;
import com.tiesverse.backend.common.exception.ResourceNotFoundException;
import com.tiesverse.backend.course.repository.CourseRepository;
import com.tiesverse.backend.discussion.dto.request.CreateDiscussionPostRequest;
import com.tiesverse.backend.discussion.dto.response.DiscussionPostResponse;
import com.tiesverse.backend.discussion.entity.DiscussionPost;
import com.tiesverse.backend.discussion.repository.DiscussionPostRepository;
import com.tiesverse.backend.user.entity.User;
import com.tiesverse.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DiscussionServiceImpl implements DiscussionService {

    private final DiscussionPostRepository discussionPostRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DiscussionPostResponse> getPostsForCourse(UUID courseId) {
        return discussionPostRepository.findByCourseIdOrderByCreatedAtAsc(courseId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public DiscussionPostResponse createPost(UUID userId, CreateDiscussionPostRequest request) {
        if (!courseRepository.existsById(request.getCourseId())) {
            throw new ResourceNotFoundException("Course", "id", request.getCourseId());
        }
        if (request.getParentId() != null && !discussionPostRepository.existsById(request.getParentId())) {
            throw new ResourceNotFoundException("DiscussionPost", "id", request.getParentId());
        }
        DiscussionPost post = DiscussionPost.builder()
                .courseId(request.getCourseId())
                .userId(userId)
                .parentId(request.getParentId())
                .content(request.getContent())
                .build();
        return toResponse(discussionPostRepository.save(post));
    }

    @Override
    public void deletePost(UUID userId, boolean isAdmin, UUID postId) {
        DiscussionPost post = discussionPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("DiscussionPost", "id", postId));
        if (!post.getUserId().equals(userId) && !isAdmin) {
            throw new ForbiddenException("You can only delete your own posts");
        }
        discussionPostRepository.deleteByParentId(postId);
        discussionPostRepository.delete(post);
    }

    private DiscussionPostResponse toResponse(DiscussionPost post) {
        String userName = userRepository.findById(post.getUserId()).map(User::getFullName).orElse(null);
        return DiscussionPostResponse.builder()
                .id(post.getId())
                .courseId(post.getCourseId())
                .userId(post.getUserId())
                .userName(userName)
                .parentId(post.getParentId())
                .content(post.getContent())
                .createdAt(post.getCreatedAt())
                .build();
    }
}
