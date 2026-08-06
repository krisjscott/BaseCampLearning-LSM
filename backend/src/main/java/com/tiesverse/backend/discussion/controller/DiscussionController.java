package com.tiesverse.backend.discussion.controller;

import com.tiesverse.backend.common.response.ApiResponse;
import com.tiesverse.backend.discussion.dto.request.CreateDiscussionPostRequest;
import com.tiesverse.backend.discussion.dto.response.DiscussionPostResponse;
import com.tiesverse.backend.discussion.service.DiscussionService;
import com.tiesverse.backend.security.AuthContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/discussions")
@RequiredArgsConstructor
public class DiscussionController {

    private final DiscussionService discussionService;
    private final AuthContext authContext;

    @GetMapping
    public ApiResponse<List<DiscussionPostResponse>> getPostsForCourse(@RequestParam UUID courseId) {
        return ApiResponse.success(discussionService.getPostsForCourse(courseId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<DiscussionPostResponse> createPost(Principal principal, @Valid @RequestBody CreateDiscussionPostRequest request) {
        UUID userId = authContext.currentUserId(principal);
        return ApiResponse.success("Post created", discussionService.createPost(userId, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deletePost(Principal principal, @PathVariable UUID id) {
        var account = authContext.currentAccount(principal);
        discussionService.deletePost(account.getUserId(), authContext.isAdmin(account), id);
        return ApiResponse.success("Post deleted", null);
    }
}
