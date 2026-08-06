"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bookmark as BookmarkIcon, StickyNote, Trash2 } from "lucide-react";
import AuthGuard from "../components/AuthGuard";
import LearningSidebar from "../components/LearningSidebar";
import {
  BookmarkResponse,
  EnrollmentResponse,
  NoteResponse,
  PublicDashboardResponse,
  UserResponse,
  createNote,
  deleteBookmark,
  deleteNote,
  getCurrentUser,
  getMyBookmarks,
  getMyEnrollments,
  getMyNotes,
  getPublicDashboard,
} from "../lib/backendApi";
import { encodeId } from "../lib/idCodec";
import { useRouter } from "next/navigation";

type SectionTab = "notes" | "bookmarks";

function NotesBookmarks() {
  const router = useRouter();
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
  const [formText, setFormText] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
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

  function closeComposer() {
    setFormOpen(false);
    setFormCourseId("");
    setFormText("");
    composerToggleRef.current?.focus();
  }

  async function submitNote() {
    const content = formText.trim();
    if (!content || !formCourseId) return;
    setSaving(true);
    try {
      const created = await createNote({ courseId: formCourseId, content });
      if (created) setNotes((prev) => [created, ...prev]);
      closeComposer();
    } catch {
      // keep the composer open so the user can retry
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteNote(noteId: string) {
    if (!window.confirm("Delete this note?")) return;
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
    } catch {
      // no-op
    }
  }

  async function handleRemoveBookmark(bookmark: BookmarkResponse) {
    try {
      await deleteBookmark(bookmark.lessonId);
      setBookmarks((prev) => prev.filter((item) => item.id !== bookmark.id));
    } catch {
      // no-op
    }
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
            <section className="certificate-share-list" aria-label="Notes">
              {formOpen && (
                <div className="inline-composer-card" id="notes-composer">
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
                  <article key={note.id}>
                    <div>
                      <h3>{note.courseTitle || "Untitled course"}{note.lessonTitle ? ` — ${note.lessonTitle}` : ""}</h3>
                      <p>{formatDate(note.createdAt)}</p>
                      {expandedId === note.id && <p>{note.content}</p>}
                    </div>
                    <div className="notes-row-actions">
                      <button type="button" onClick={() => setExpandedId((prev) => (prev === note.id ? null : note.id))}>
                        {expandedId === note.id ? "Hide" : "Open ->"}
                      </button>
                      <button type="button" className="is-ghost" aria-label="Delete note" onClick={() => handleDeleteNote(note.id)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <p className="notes-empty">
                  {enrollments.length ? "No notes saved yet." : "Enroll in a course to start taking notes."}
                </p>
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
                <p className="notes-empty">No bookmarked lessons yet - bookmark a lesson from its video player.</p>
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
