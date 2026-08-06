"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Trash2 } from "lucide-react";
import AuthGuard from "../components/AuthGuard";
import LearningSidebar from "../components/LearningSidebar";
import {
  CourseResponse,
  DiscussionPostResponse,
  PublicDashboardResponse,
  UserResponse,
  createDiscussionPost,
  deleteDiscussionPost,
  getCourse,
  getCurrentUser,
  getDiscussionPosts,
  getPublicDashboard,
} from "../lib/backendApi";
import { decodeParam } from "../lib/idCodec";

function DiscussionForum() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [dashboard, setDashboard] = useState<PublicDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [courseId, setCourseId] = useState<string | null>(null);
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [courseLoading, setCourseLoading] = useState(false);

  const [posts, setPosts] = useState<DiscussionPostResponse[]>([]);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getCurrentUser(), getPublicDashboard()]).then(([u, d]) => {
      if (!active) return;
      if (u.status === "fulfilled") setUser(u.value);
      setDashboard(d.status === "fulfilled" ? d.value : null);
    }).finally(() => active && setLoading(false));

    const params = new URLSearchParams(window.location.search);
    const id = decodeParam(params, "courseId");
    setCourseId(id);
    if (id) {
      setCourseLoading(true);
      Promise.all([
        getCourse(id).catch(() => null),
        getDiscussionPosts(id).catch(() => []),
      ])
        .then(([courseResult, postsResult]) => {
          if (!active) return;
          setCourse(courseResult);
          setPosts(postsResult);
        })
        .finally(() => active && setCourseLoading(false));
    }

    return () => {
      active = false;
    };
  }, []);

  async function submitPost() {
    const text = draft.trim();
    if (!text || !courseId) return;
    setPosting(true);
    try {
      const created = await createDiscussionPost(courseId, text);
      if (created) setPosts((prev) => [created, ...prev]);
      setDraft("");
    } catch {
      // keep the draft so the user can retry
    } finally {
      setPosting(false);
    }
  }

  async function removePost(postId: string) {
    if (!window.confirm("Delete this post?")) return;
    try {
      await deleteDiscussionPost(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch {
      // no-op
    }
  }

  function focusComposer() {
    composerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    composerRef.current?.focus();
  }

  const subtitle = courseId
    ? courseLoading
      ? "Loading course..."
      : course
        ? `Discussion for ${course.title}`
        : "Ask questions and learn with your course community."
    : "Ask questions and learn with your course community.";

  return (
    <main className="certificate-detail-page course-discussion-page">
      <LearningSidebar activeHref="/learning" dashboard={dashboard} loading={loading} user={user} />

      <section className="certificate-detail-main">
        <header className="certificate-detail-header">
          <div>
            <h1>Course Discussion</h1>
            <p>{subtitle}</p>
          </div>
          <button type="button" onClick={focusComposer}>
            <MessageCircle size={18} />
            <span>New post</span>
          </button>
        </header>

        <section className="certificate-detail-hero">
          <h2>{course ? course.title : "Course discussion"}</h2>
          <p>Share questions, tips and resources with other learners.</p>
          <button type="button" onClick={focusComposer}>Join discussion -&gt;</button>
        </section>

        <section className="certificate-detail-stats" aria-label="Discussion summary">
          <article>
            <strong>{posts.length}</strong>
            <p>Posts this session</p>
          </article>
        </section>

        <h2 className="share-certificate-title">Start a discussion</h2>
        <div className="certificate-detail-grid">
          <section className="certificate-share-list" aria-label="New post composer">
            <div className="inline-composer-card">
              <textarea
                ref={composerRef}
                className="inline-textarea"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask a question or share something with the course community..."
                rows={4}
              />
              <div className="composer-actions">
                <button type="button" onClick={submitPost} disabled={!draft.trim() || !courseId || posting}>
                  {posting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>

            {courseLoading ? (
              <p className="admin-empty">Loading discussion...</p>
            ) : posts.length ? (
              posts.map((post) => (
                <article key={post.id}>
                  <div>
                    <h3>{post.content}</h3>
                    <p>{post.userName || "Learner"} - {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}</p>
                  </div>
                  {user?.id === post.userId && (
                    <button type="button" className="is-ghost" aria-label="Delete post" onClick={() => removePost(post.id)}>
                      <Trash2 size={15} />
                    </button>
                  )}
                </article>
              ))
            ) : (
              <p className="admin-empty">No posts yet. Be the first to start the discussion.</p>
            )}
          </section>

          <aside className="verification-card">
            <h2>Community guidelines</h2>
            <p>Keep discussion useful, respectful and course-related.</p>
            <button type="button" onClick={() => setGuidelinesOpen((prev) => !prev)}>
              {guidelinesOpen ? "Hide guidelines" : "Read guidelines ->"}
            </button>
            {guidelinesOpen && (
              <p className="expandable-note">
                Be respectful, stay on topic, avoid sharing personal information, and search existing
                posts before starting a new one. Cite sources when sharing external material and keep
                feedback constructive.
              </p>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

export default function DiscussionForumPage() {
  return (
    <AuthGuard>
      <DiscussionForum />
    </AuthGuard>
  );
}
