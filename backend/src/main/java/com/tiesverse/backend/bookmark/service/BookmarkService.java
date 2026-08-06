package com.tiesverse.backend.bookmark.service;

import com.tiesverse.backend.bookmark.dto.request.CreateBookmarkRequest;
import com.tiesverse.backend.bookmark.dto.response.BookmarkResponse;

import java.util.List;
import java.util.UUID;

public interface BookmarkService {

    List<BookmarkResponse> getMyBookmarks(UUID userId);

    BookmarkResponse createBookmark(UUID userId, CreateBookmarkRequest request);

    void deleteBookmark(UUID userId, UUID lessonId);
}
