"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import AuthGuard from "../components/AuthGuard";
import { CardSkeleton } from "../components/Skeleton";
import { LessonResponse, getCurrentUser, getLesson, updateCourseProgress } from "../lib/backendApi";
import { decodeParam, encodeId } from "../lib/idCodec";

function ReadingLesson() {
  const router = useRouter();
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [markedComplete, setMarkedComplete] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = decodeParam(params, "lessonId");
    const course = decodeParam(params, "courseId");
    setLessonId(id);
    setCourseId(course);

    getCurrentUser().then((user) => setUserId(user?.id || null)).catch(() => undefined);

    if (!id) {
      setLoading(false);
      return;
    }

    getLesson(id)
      .then(setLesson)
      .catch(() => setLesson(null))
      .finally(() => setLoading(false));
  }, []);

  const sections = useMemo(() => {
    const description = lesson?.description || "";
    return description
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .filter(Boolean);
  }, [lesson]);

  async function markComplete() {
    if (markedComplete || savingProgress) return;
    if (!courseId || !userId || !lessonId) {
      setMarkedComplete(true);
      return;
    }
    setSavingProgress(true);
    try {
      await updateCourseProgress(courseId, userId, {
        lessonId,
        completed: true,
        timeSpentMinutes: lesson?.durationMinutes || undefined,
      });
      setMarkedComplete(true);
    } catch {
      // no-op: keep the button available to retry
    } finally {
      setSavingProgress(false);
    }
  }

  function scrollToSection(index: number) {
    document.getElementById(`reading-section-${index}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function continueReading() {
    const nextUnread = sections.length ? sections.length - 1 : -1;
    if (nextUnread >= 0 && !markedComplete) {
      scrollToSection(nextUnread);
    }
    await markComplete();
    if (courseId) {
      router.push(`/course?courseId=${encodeId(courseId)}`);
    }
  }

  return (
    <main className="lesson-player reading-lesson-page">
      <header className="lesson-topbar">
        <div className="lesson-brand-block">
          <img src="/basecamp-logo.png" alt="BaseCamp" />
          <span />
          <section>
            {loading ? (
              <p>Loading lesson...</p>
            ) : (
              <>
                <strong>{lesson?.title || "Reading lesson"}</strong>
                <p>{lesson?.contentType || "Reading"}</p>
              </>
            )}
          </section>
        </div>
        <div className="lesson-top-actions">
          <button type="button" onClick={markComplete} disabled={markedComplete || savingProgress}>
            <FileText size={16} />
            <span>{markedComplete ? "Completed" : savingProgress ? "Saving..." : "Mark complete"}</span>
          </button>
        </div>
      </header>

      <section className="certificate-detail-main">
        {loading ? (
          <CardSkeleton lines={4} />
        ) : !lesson ? (
          <section className="certificate-detail-hero">
            <h2>Lesson not found</h2>
            <p>Open this page from a course to load a real lesson.</p>
          </section>
        ) : (
          <>
            <section className="certificate-detail-hero">
              <h2>{lesson.title}</h2>
              <p>
                {lesson.durationMinutes ? `Estimated reading time: ${lesson.durationMinutes} minutes` : "Reading lesson"}
                {markedComplete ? " - Completed" : ""}
              </p>
              <button type="button" onClick={continueReading}>Continue reading -&gt;</button>
            </section>

            <section className="certificate-detail-stats" aria-label="Reading lesson summary">
              <article>
                <strong>{lesson.durationMinutes ? `${lesson.durationMinutes} min` : "-"}</strong>
                <p>Estimated</p>
              </article>
              <article>
                <strong>{lesson.contentType || "Reading"}</strong>
                <p>Type</p>
              </article>
              <article>
                <strong>{markedComplete ? "Complete" : "In progress"}</strong>
                <p>Status</p>
              </article>
            </section>

            <h2 className="share-certificate-title">Lesson content</h2>

            <div className="certificate-detail-grid">
              <section className="certificate-share-list" aria-label="Lesson sections">
                {sections.length ? (
                  sections.map((section, index) => (
                    <article key={index} id={`reading-section-${index}`}>
                      <div>
                        <h3>Section {index + 1}</h3>
                        <p>{section}</p>
                      </div>
                      <button type="button" onClick={() => scrollToSection(index)}>Read -&gt;</button>
                    </article>
                  ))
                ) : (
                  <article>
                    <div>
                      <h3>No reading content available</h3>
                      <p>This lesson does not have a description to display.</p>
                    </div>
                  </article>
                )}
              </section>

              <aside className="verification-card">
                <h2>Lesson requirement</h2>
                <p>Mark this reading complete once you have gone through the content.</p>
                <button type="button" onClick={() => router.push("/progress")}>View progress -&gt;</button>
              </aside>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default function ReadingLessonPage() {
  return (
    <AuthGuard>
      <ReadingLesson />
    </AuthGuard>
  );
}
