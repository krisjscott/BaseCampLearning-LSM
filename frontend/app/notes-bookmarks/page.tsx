"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import AuthGuard from "../components/AuthGuard";
import LearningSidebar from "../components/LearningSidebar";
import { PublicDashboardResponse, UserResponse, getCurrentUser, getPublicDashboard } from "../lib/backendApi";

type LocalNote = {
  id: string;
  title: string;
  text: string;
  createdAt: string;
};

function NotesBookmarks() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [dashboard, setDashboard] = useState<PublicDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [notes, setNotes] = useState<LocalNote[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formText, setFormText] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getCurrentUser(), getPublicDashboard()]).then(([u, d]) => {
      if (!active) return;
      if (u.status === "fulfilled") setUser(u.value);
      setDashboard(d.status === "fulfilled" ? d.value : null);
    }).finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  function createNote() {
    const title = formTitle.trim();
    const text = formText.trim();
    if (!title) return;
    setNotes((prev) => [
      { id: `note-${Date.now()}`, title, text, createdAt: new Date().toLocaleString() },
      ...prev,
    ]);
    setFormTitle("");
    setFormText("");
    setFormOpen(false);
  }

  function exportNotes() {
    const payload = JSON.stringify(
      notes.map(({ title, text, createdAt }) => ({ title, text, createdAt })),
      null,
      2,
    );
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "basecamp-notes.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="certificate-detail-page notes-bookmarks-page">
      <LearningSidebar activeHref="/learning" dashboard={dashboard} loading={loading} user={user} />

      <section className="certificate-detail-main">
        <header className="certificate-detail-header">
          <div>
            <h1>Notes &amp; Bookmarks</h1>
            <p>Jot down and revisit notes from your courses.</p>
          </div>
          <button type="button" onClick={() => setFormOpen((prev) => !prev)}>
            <Bookmark size={18} />
            <span>Create note</span>
          </button>
        </header>

        <section className="certificate-detail-hero">
          <h2>{notes.length} saved this session</h2>
          <p className="session-note is-tight">
            Notes are local to this browser session until note-taking is supported by the backend.
          </p>
        </section>

        <section className="certificate-detail-stats" aria-label="Saved learning summary">
          <article>
            <strong>{notes.length}</strong>
            <p>Notes this session</p>
          </article>
        </section>

        <h2 className="share-certificate-title">Recently saved</h2>

        <div className="certificate-detail-grid">
          <section className="certificate-share-list" aria-label="Recently saved">
            {formOpen && (
              <div className="inline-composer-card">
                <input
                  type="text"
                  className="inline-text-input"
                  value={formTitle}
                  onChange={(event) => setFormTitle(event.target.value)}
                  placeholder="Note title"
                />
                <textarea
                  className="inline-textarea"
                  value={formText}
                  onChange={(event) => setFormText(event.target.value)}
                  placeholder="Note details..."
                  rows={3}
                />
                <div className="composer-actions">
                  <button type="button" className="is-ghost" onClick={() => setFormOpen(false)}>Cancel</button>
                  <button type="button" onClick={createNote} disabled={!formTitle.trim()}>Save note</button>
                </div>
              </div>
            )}

            {notes.length ? (
              notes.map((note) => (
                <article key={note.id}>
                  <div>
                    <h3>{note.title}</h3>
                    <p>{note.createdAt}</p>
                    {expandedId === note.id && note.text && <p>{note.text}</p>}
                  </div>
                  {note.text && (
                    <button type="button" onClick={() => setExpandedId((prev) => (prev === note.id ? null : note.id))}>
                      {expandedId === note.id ? "Hide" : "Open ->"}
                    </button>
                  )}
                </article>
              ))
            ) : (
              <p className="admin-empty">No notes saved yet this session.</p>
            )}
          </section>

          <aside className="verification-card">
            <h2>Export notes</h2>
            <p>Download your session notes as a JSON file.</p>
            <button type="button" onClick={exportNotes} disabled={!notes.length}>Export -&gt;</button>
          </aside>
        </div>
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
