package com.tiesverse.backend.notes.service;

import com.tiesverse.backend.notes.dto.request.CreateNoteRequest;
import com.tiesverse.backend.notes.dto.request.UpdateNoteRequest;
import com.tiesverse.backend.notes.dto.response.NoteResponse;

import java.util.List;
import java.util.UUID;

public interface NoteService {

    List<NoteResponse> getMyNotes(UUID userId, UUID courseId, UUID lessonId);

    NoteResponse createNote(UUID userId, CreateNoteRequest request);

    NoteResponse updateNote(UUID userId, UUID noteId, UpdateNoteRequest request);

    void deleteNote(UUID userId, UUID noteId);
}
