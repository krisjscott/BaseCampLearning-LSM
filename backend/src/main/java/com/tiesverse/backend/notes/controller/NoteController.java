package com.tiesverse.backend.notes.controller;

import com.tiesverse.backend.common.response.ApiResponse;
import com.tiesverse.backend.notes.dto.request.CreateNoteRequest;
import com.tiesverse.backend.notes.dto.request.UpdateNoteRequest;
import com.tiesverse.backend.notes.dto.response.NoteResponse;
import com.tiesverse.backend.notes.service.NoteService;
import com.tiesverse.backend.security.AuthContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;
    private final AuthContext authContext;

    @GetMapping
    public ApiResponse<List<NoteResponse>> getMyNotes(Principal principal,
                                                          @RequestParam(required = false) UUID courseId,
                                                          @RequestParam(required = false) UUID lessonId) {
        UUID userId = authContext.currentUserId(principal);
        return ApiResponse.success(noteService.getMyNotes(userId, courseId, lessonId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<NoteResponse> createNote(Principal principal, @Valid @RequestBody CreateNoteRequest request) {
        UUID userId = authContext.currentUserId(principal);
        return ApiResponse.success("Note created", noteService.createNote(userId, request));
    }

    @PutMapping("/{id}")
    public ApiResponse<NoteResponse> updateNote(Principal principal, @PathVariable UUID id,
                                                   @Valid @RequestBody UpdateNoteRequest request) {
        UUID userId = authContext.currentUserId(principal);
        return ApiResponse.success("Note updated", noteService.updateNote(userId, id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteNote(Principal principal, @PathVariable UUID id) {
        UUID userId = authContext.currentUserId(principal);
        noteService.deleteNote(userId, id);
        return ApiResponse.success("Note deleted", null);
    }
}
