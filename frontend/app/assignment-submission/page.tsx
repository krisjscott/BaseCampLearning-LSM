"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import AuthGuard from "../components/AuthGuard";
import { CardSkeleton } from "../components/Skeleton";
import { useToast } from "../components/Toast";
import {
  AssignmentSubmissionResponse,
  getLesson,
  getMyAssignmentSubmission,
  submitAssignment,
} from "../lib/backendApi";
import { decodeParam, encodeId } from "../lib/idCodec";

function AssignmentSubmission() {
  const router = useRouter();
  const toast = useToast();
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState<string | null>(null);
  const [lessonDescription, setLessonDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [responseText, setResponseText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [existing, setExisting] = useState<AssignmentSubmissionResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = decodeParam(params, "assignmentId");
    const course = decodeParam(params, "courseId");
    setAssignmentId(id);
    setCourseId(course);

    if (!id) {
      setLoading(false);
      return;
    }

    Promise.all([
      getLesson(id).catch(() => null),
      getMyAssignmentSubmission(id).catch(() => null),
    ])
      .then(([lesson, submission]) => {
        setLessonTitle(lesson?.title || null);
        setLessonDescription(lesson?.description || null);
        setExisting(submission);
        if (submission?.submissionText) setResponseText(submission.submissionText);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] || null);
  }

  async function handleSubmit() {
    if (!assignmentId || (!responseText.trim() && !file)) return;
    setSubmitting(true);
    setStatusMessage(null);
    try {
      const result = await submitAssignment(assignmentId, responseText.trim() || undefined, file || undefined);
      setExisting(result);
      setFile(null);
      setStatusMessage("Submission saved");
      toast.success("Submission saved");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not submit this assignment.";
      setStatusMessage(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  function exitAssignment() {
    router.push(courseId ? `/course?courseId=${encodeId(courseId)}` : "/learning");
  }

  return (
    <main className="lesson-player assignment-submission-page">
      <header className="lesson-topbar">
        <div className="lesson-brand-block">
          <img src="/basecamp-logo.png" alt="BaseCamp" />
          <span />
          <section>
            <strong>{lessonTitle || "Practical Assignment"}</strong>
            <p>{loading ? "Loading assignment..." : lessonDescription || "Submit your response below."}</p>
          </section>
        </div>
        <div className="lesson-top-actions">
          {statusMessage && <p>{statusMessage}</p>}
          <button type="button" onClick={exitAssignment}>
            <X size={16} />
            <span>Exit</span>
          </button>
        </div>
      </header>

      <section className="certificate-detail-main">
        {loading ? (
          <CardSkeleton lines={4} />
        ) : (
          <>
            <section className="certificate-detail-stats" aria-label="Assignment summary">
              <article>
                <strong>{existing ? existing.status : "Not submitted"}</strong>
                <p>Status</p>
              </article>
              <article>
                <strong>{existing?.score != null ? existing.score : "-"}</strong>
                <p>Score</p>
              </article>
              <article>
                <strong>{existing?.fileUrl ? "1" : file ? "1" : "0"}</strong>
                <p>Files attached</p>
              </article>
            </section>

            <h2 className="share-certificate-title">Submission</h2>

            <div className="certificate-detail-grid">
              <section className="certificate-share-list" aria-label="Submission">
                <div className="inline-composer-card">
                  <div className="card-title">
                    <h3>Written response</h3>
                    <p>Add your response for this assignment</p>
                  </div>
                  <textarea
                    className="inline-textarea"
                    value={responseText}
                    onChange={(event) => setResponseText(event.target.value)}
                    placeholder="Write your response..."
                    rows={5}
                  />
                </div>

                <div className="inline-composer-card">
                  <div className="card-title">
                    <h3>Supporting document</h3>
                    <p>Attach a file for this assignment</p>
                  </div>
                  <input type="file" onChange={handleFileChange} />
                  {file ? (
                    <p className="field-note">Selected: {file.name}, ready to submit</p>
                  ) : existing?.fileUrl ? (
                    <p className="field-note">
                      <a href={existing.fileUrl} target="_blank" rel="noreferrer">Previously submitted file -&gt;</a>
                    </p>
                  ) : null}
                </div>

                <div className="composer-actions">
                  <button type="button" onClick={handleSubmit} disabled={submitting || (!responseText.trim() && !file)}>
                    {submitting ? "Submitting..." : existing ? "Resubmit" : "Submit assignment"}
                  </button>
                </div>
              </section>

              <aside className="verification-card">
                <h2>Feedback</h2>
                {existing?.status === "GRADED" ? (
                  <>
                    <p className="session-note is-tight">Graded by {existing.gradedByName || "an instructor"}</p>
                    <p>{existing.feedback || "No written feedback was left."}</p>
                  </>
                ) : (
                  <p className="session-note is-tight">Feedback will appear here once this assignment is graded.</p>
                )}
              </aside>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default function AssignmentSubmissionPage() {
  return (
    <AuthGuard>
      <AssignmentSubmission />
    </AuthGuard>
  );
}
