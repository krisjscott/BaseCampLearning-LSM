package com.tiesverse.backend.bookmark.controller;

import com.tiesverse.backend.bookmark.dto.request.CreateBookmarkRequest;
import com.tiesverse.backend.bookmark.dto.response.BookmarkResponse;
import com.tiesverse.backend.bookmark.service.BookmarkService;
import com.tiesverse.backend.common.response.ApiResponse;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;
    private final AuthContext authContext;

    @GetMapping
    public ApiResponse<List<BookmarkResponse>> getMyBookmarks(Principal principal) {
        UUID userId = authContext.currentUserId(principal);
        return ApiResponse.success(bookmarkService.getMyBookmarks(userId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<BookmarkResponse> createBookmark(Principal principal, @Valid @RequestBody CreateBookmarkRequest request) {
        UUID userId = authContext.currentUserId(principal);
        return ApiResponse.success("Bookmark created", bookmarkService.createBookmark(userId, request));
    }

    @DeleteMapping("/lesson/{lessonId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteBookmark(Principal principal, @PathVariable UUID lessonId) {
        UUID userId = authContext.currentUserId(principal);
        bookmarkService.deleteBookmark(userId, lessonId);
        return ApiResponse.success("Bookmark removed", null);
    }
}
