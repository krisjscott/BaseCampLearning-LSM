"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bookmark as BookmarkIcon, Check, Pencil, StickyNote, Trash2, X } from "lucide-react";
import AuthGuard from "../components/AuthGuard";
import LearningSidebar from "../components/LearningSidebar";
import { useToast } from "../components/Toast";
import {
  BookmarkResponse,
  EnrollmentResponse,
  LessonResponse,
  ModuleResponse,
  NoteResponse,
  PublicDashboardResponse,
  UserResponse,
  createNote,
  deleteBookmark,
  deleteNote,
  getCourseModules,
  getCurrentUser,
  getMyBookmarks,
  getMyEnrollments,
  getMyNotes,
  getPublicDashboard,
  updateNote,
} from "../lib/backendApi";
import { encodeId } from "../lib/idCodec";
import { useRouter } from "next/navigation";

type SectionTab = "notes" | "bookmarks";

function NotesBookmarks() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [dashboard, setDashboard] = useState<PublicDashboardResponse | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [tab, setTab] = useState<SectionTab>("notes");
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkResponse[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formCourseId, setFormCourseId] = useState("");
  const [formLessonId, setFormLessonId] = useState("");
  const [formLessons, setFormLessons] = useState<LessonResponse[]>([]);
  const [formText, setFormText] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const composerToggleRef = useRef<HTMLButtonElement>(null);

  const loadAll = useCallback(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    getCurrentUser()
      .then((currentUser) => {
        if (!active) return;
        setUser(currentUser);
        return Promise.allSettled([
          getPublicDashboard(),
          getMyNotes(),
          getMyBookmarks(),
          currentUser ? getMyEnrollments(currentUser.id) : Promise.resolve([]),
        ]);
      })
      .then((results) => {
        if (!active || !results) return;
        const [dashboardResult, notesResult, bookmarksResult, enrollmentsResult] = results;
        setDashboard(dashboardResult.status === "fulfilled" ? dashboardResult.value : null);
        setNotes(notesResult.status === "fulfilled" ? notesResult.value : []);
        setBookmarks(bookmarksResult.status === "fulfilled" ? bookmarksResult.value : []);
        setEnrollments(enrollmentsResult.status === "fulfilled" ? (enrollmentsResult.value as EnrollmentResponse[]) : []);
      })
      .catch(() => setLoadError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => loadAll(), [loadAll]);

  useEffect(() => {
    setFormLessonId("");
    if (!formCourseId) {
      setFormLessons([]);
      return;
    }
    getCourseModules(formCourseId)
      .then((modules: ModuleResponse[]) => setFormLessons(modules.flatMap((m) => m.lessons || [])))
      .catch(() => setFormLessons([]));
  }, [formCourseId]);

  function closeComposer() {
    setFormOpen(false);
    setFormCourseId("");
    setFormLessonId("");
    setFormLessons([]);
    setFormText("");
    composerToggleRef.current?.focus();
  }

  async function submitNote() {
    const content = formText.trim();
    if (!content || !formCourseId) return;
    setSaving(true);
    try {
      const created = await createNote({ courseId: formCourseId, lessonId: formLessonId || undefined, content });
      if (created) setNotes((prev) => [created, ...prev]);
      closeComposer();
      toast.success("Note saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save this note.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(note: NoteResponse) {
    setEditingId(note.id);
    setEditText(note.content);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  async function saveEdit(noteId: string) {
    const content = editText.trim();
    if (!content) return;
    setSavingEdit(true);
    try {
      const updated = await updateNote(noteId, content);
      setNotes((prev) => prev.map((note) => (note.id === noteId ? (updated ?? { ...note, content }) : note)));
      setEditingId(null);
      setEditText("");
      toast.success("Note updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update this note.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDeleteNote(noteId: string) {
    if (!window.confirm("Delete this note? This cannot be undone.")) return;
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      toast.success("Note deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete this note.");
    }
  }

  async function handleRemoveBookmark(bookmark: BookmarkResponse) {
    try {
      await deleteBookmark(bookmark.lessonId);
      setBookmarks((prev) => prev.filter((item) => item.id !== bookmark.id));
      toast.success("Bookmark removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove this bookmark.");
    }
  }

  function openNoteLesson(note: NoteResponse) {
    if (!note.lessonId) return;
    router.push(`/lesson?lessonId=${encodeId(note.lessonId)}&courseId=${encodeId(note.courseId)}`);
  }

  function formatDate(value?: string | null) {
    if (!value) return "";
    return new Date(value).toLocaleString();
  }

  return (
    <main className="certificate-detail-page notes-bookmarks-page">
      <LearningSidebar activeHref="/notes-bookmarks" dashboard={dashboard} loading={loading} user={user} />

      <section className="certificate-detail-main">
        <header className="certificate-detail-header">
          <div>
            <h1>Notes &amp; Bookmarks</h1>
            <p>Notes and saved lessons from your courses.</p>
          </div>
          {tab === "notes" && (
            <button
              type="button"
              ref={composerToggleRef}
              aria-expanded={formOpen}
              aria-controls="notes-composer"
              onClick={() => (formOpen ? closeComposer() : setFormOpen(true))}
              disabled={!enrollments.length}
              title={!enrollments.length ? "Enroll in a course to start taking notes" : undefined}
            >
              <StickyNote size={18} />
              <span>New note</span>
            </button>
          )}
        </header>

        {loadError && (
          <p className="status-message is-error">
            Could not load your notes.{" "}
            <button type="button" onClick={loadAll}>Retry</button>
          </p>
        )}

        <nav className="lesson-tabs" aria-label="Notes and bookmarks sections">
          <button type="button" className={tab === "notes" ? "active" : ""} onClick={() => setTab("notes")}>
            <StickyNote size={16} />
            <span>Notes ({notes.length})</span>
          </button>
          <button type="button" className={tab === "bookmarks" ? "active" : ""} onClick={() => setTab("bookmarks")}>
            <BookmarkIcon size={16} />
            <span>Bookmarks ({bookmarks.length})</span>
          </button>
        </nav>

        {tab === "notes" && (
          <div className="certificate-detail-grid">
            <section className="certificate-share-list notes-list" aria-label="Notes">
              {formOpen && (
                <div className="inline-composer-card" id="notes-composer">
                  <div className="notes-composer-selects">
                    <select
                      className="inline-text-input"
                      value={formCourseId}
                      onChange={(event) => setFormCourseId(event.target.value)}
                    >
                      <option value="">Choose a course</option>
                      {enrollments.map((enrollment) => (
                        <option key={enrollment.courseId} value={enrollment.courseId}>
                          {enrollment.courseTitle || "Untitled course"}
                        </option>
                      ))}
                    </select>
                    <select
                      className="inline-text-input"
                      value={formLessonId}
                      onChange={(event) => setFormLessonId(event.target.value)}
                      disabled={!formCourseId || !formLessons.length}
                    >
                      <option value="">General note (no specific lesson)</option>
                      {formLessons.map((lesson) => (
                        <option key={lesson.id} value={lesson.id}>
                          {lesson.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    className="inline-textarea"
                    value={formText}
                    onChange={(event) => setFormText(event.target.value)}
                    placeholder="Note details..."
                    rows={3}
                  />
                  <div className="composer-actions">
                    <button type="button" className="is-ghost" onClick={closeComposer}>Cancel</button>
                    <button type="button" onClick={submitNote} disabled={!formText.trim() || !formCourseId || saving}>
                      {saving ? "Saving..." : "Save note"}
                    </button>
                  </div>
                </div>
              )}

              {notes.length ? (
                notes.map((note) => (
                  <article className="note-card" key={note.id}>
                    <div>
                      <h3>{note.courseTitle || "Untitled course"}{note.lessonTitle ? ` — ${note.lessonTitle}` : ""}</h3>
                      <p className="note-card-date">{formatDate(note.createdAt)}</p>
                      {editingId === note.id ? (
                        <textarea
                          className="inline-textarea"
                          value={editText}
                          onChange={(event) => setEditText(event.target.value)}
                          rows={3}
                          autoFocus
                        />
                      ) : (
                        <p className="note-card-content">{note.content}</p>
                      )}
                    </div>
                    <div className="notes-row-actions">
                      {editingId === note.id ? (
                        <>
                          <button
                            type="button"
                            aria-label="Save changes"
                            onClick={() => saveEdit(note.id)}
                            disabled={!editText.trim() || savingEdit}
                          >
                            <Check size={15} />
                          </button>
                          <button type="button" className="is-ghost" aria-label="Cancel editing" onClick={cancelEdit}>
                            <X size={15} />
                          </button>
                        </>
                      ) : (
                        <>
                          {note.lessonId && (
                            <button type="button" onClick={() => openNoteLesson(note)}>Open lesson -&gt;</button>
                          )}
                          <button type="button" className="is-ghost" aria-label="Edit note" onClick={() => startEdit(note)}>
                            <Pencil size={15} />
                          </button>
                          <button type="button" className="is-ghost" aria-label="Delete note" onClick={() => handleDeleteNote(note.id)}>
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <article className="empty-state-card">
                  <div>
                    <h3>{enrollments.length ? "No notes saved yet" : "Enroll in a course to start taking notes"}</h3>
                    <p>
                      {enrollments.length
                        ? "Notes you save here, or from a lesson's video player, will show up in this list."
                        : "Browse the catalog and enroll in a course to unlock notes."}
                    </p>
                  </div>
                  {!enrollments.length && (
                    <button type="button" onClick={() => router.push("/explore")}>Browse courses -&gt;</button>
                  )}
                </article>
              )}
            </section>
          </div>
        )}

        {tab === "bookmarks" && (
          <div className="certificate-detail-grid">
            <section className="certificate-share-list" aria-label="Bookmarks">
              {bookmarks.length ? (
                bookmarks.map((bookmark) => (
                  <article key={bookmark.id}>
                    <div>
                      <h3>{bookmark.lessonTitle || "Untitled lesson"}</h3>
                      <p>{bookmark.courseTitle || "Untitled course"} - saved {formatDate(bookmark.createdAt)}</p>
                    </div>
                    <div className="notes-row-actions">
                      <button
                        type="button"
                        onClick={() => router.push(`/lesson?lessonId=${encodeId(bookmark.lessonId)}&courseId=${encodeId(bookmark.courseId)}`)}
                      >
                        Open -&gt;
                      </button>
                      <button type="button" className="is-ghost" aria-label="Remove bookmark" onClick={() => handleRemoveBookmark(bookmark)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <article className="empty-state-card">
                  <div>
                    <h3>No bookmarked lessons yet</h3>
                    <p>Bookmark a lesson from its video player to save it here for quick access later.</p>
                  </div>
                </article>
              )}
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

export default function NotesBookmarksPage() {
  return (
    <AuthGuard>
      <NotesBookmarks />
    </AuthGuard>
  );
}
