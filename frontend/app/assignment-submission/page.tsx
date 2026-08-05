"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import AuthGuard from "../components/AuthGuard";
import { decodeParam, encodeId } from "../lib/idCodec";

const requirements = [
  { title: "Written response", description: "Add your response for this assignment" },
] as const;

type DraftState = {
  responses: Record<string, string>;
  fileName: string | null;
};

function AssignmentSubmission() {
  const router = useRouter();
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);

  const [responses, setResponses] = useState<Record<string, string>>({});
  const [openResponseFor, setOpenResponseFor] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = decodeParam(params, "assignmentId");
    const course = decodeParam(params, "courseId");
    setAssignmentId(id);
    setCourseId(course);

    const key = `assignment-draft-${id || "draft"}`;
    const saved = sessionStorage.getItem(key);
    if (saved) {
      try {
        const parsed: DraftState = JSON.parse(saved);
        setResponses(parsed.responses || {});
        setFileName(parsed.fileName || null);
      } catch {
        // ignore malformed local draft
      }
    }
  }, []);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileName(file ? file.name : null);
  }

  function saveDraft() {
    const key = `assignment-draft-${assignmentId || "draft"}`;
    const payload: DraftState = { responses, fileName };
    sessionStorage.setItem(key, JSON.stringify(payload));
    setDraftMessage("Draft saved");
    setTimeout(() => setDraftMessage(null), 3000);
  }

  function exitAssignment() {
    router.push(courseId ? `/course?courseId=${encodeId(courseId)}` : "/learning");
  }

  const respondedCount = Object.values(responses).filter((value) => value.trim()).length;

  return (
    <main className="lesson-player assignment-submission-page">
      <header className="lesson-topbar">
        <div className="lesson-brand-block">
          <img src="/basecamp-logo.png" alt="BaseCamp" />
          <span />
          <section>
            <strong>{assignmentId ? `Assignment ${assignmentId}` : "Practical Assignment"}</strong>
            <p>
              {assignmentId
                ? "Assignment details are not yet available for this ID."
                : "Open this page from a course to load a real assignment."}
            </p>
          </section>
        </div>
        <div className="lesson-top-actions">
          {draftMessage && <p>{draftMessage}</p>}
          <button type="button" onClick={saveDraft}>
            <Upload size={16} />
            <span>Save draft</span>
          </button>
          <button type="button" onClick={exitAssignment}>
            <X size={16} />
            <span>Exit</span>
          </button>
        </div>
      </header>

      <section className="certificate-detail-main">
        <section className="certificate-detail-stats" aria-label="Assignment summary">
          <article>
            <strong>{assignmentId || "None"}</strong>
            <p>Assignment ID</p>
          </article>
          <article>
            <strong>{fileName ? "1" : "0"}</strong>
            <p>Files attached</p>
          </article>
          <article>
            <strong>{respondedCount}</strong>
            <p>Responses drafted</p>
          </article>
        </section>

        <h2 className="share-certificate-title">Submission requirements</h2>

        <div className="certificate-detail-grid">
          <section className="certificate-share-list" aria-label="Submission requirements">
            {requirements.map((req) => (
              <div className="inline-composer-card" key={req.title}>
                <div className="card-title">
                  <h3>{req.title}</h3>
                  <p>{req.description}</p>
                </div>
                {openResponseFor === req.title ? (
                  <textarea
                    className="inline-textarea"
                    value={responses[req.title] || ""}
                    onChange={(event) =>
                      setResponses((prev) => ({ ...prev, [req.title]: event.target.value }))
                    }
                    placeholder="Write your response..."
                    rows={4}
                  />
                ) : (
                  <div className="composer-actions is-start">
                    <button type="button" className="is-ghost" onClick={() => setOpenResponseFor(req.title)}>
                      {responses[req.title] ? "Edit response ->" : "Add response ->"}
                    </button>
                  </div>
                )}
              </div>
            ))}

            <div className="inline-composer-card">
              <div className="card-title">
                <h3>Supporting document</h3>
                <p>PDF or DOCX - attach a file for this assignment</p>
              </div>
              <input type="file" onChange={handleFileChange} />
              {fileName && <p className="field-note">Selected: {fileName}, ready to submit</p>}
            </div>
          </section>

          <aside className="verification-card">
            <h2>Assessment rubric</h2>
            <p className="session-note is-tight">Rubric details aren&apos;t available for this assignment yet.</p>
          </aside>
        </div>
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
