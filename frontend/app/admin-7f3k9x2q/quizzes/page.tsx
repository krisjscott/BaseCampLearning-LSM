"use client";

import {
  Award,
  ChevronDown,
  ChevronRight,
  ListChecks,
  Plus,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminGuard from "../../components/AdminGuard";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { CardSkeleton } from "../../components/Skeleton";
import { CourseResponse, getAuthSession, getCurrentUser, UserResponse } from "../../lib/backendApi";
import {
  AdminAssessmentResponse,
  AdminOptionInput,
  createAssessment,
  createQuestion,
  deleteAssessment,
  deleteQuestion,
  getAdminCourses,
  getAssessmentsByCourse,
} from "../../lib/adminApi";

type AssessmentFormState = {
  title: string;
  description: string;
  type: "QUIZ" | "MCQ" | "ASSIGNMENT" | "CODING";
  passingScore: string;
  timeLimitMinutes: string;
  maxAttempts: string;
};

const emptyAssessmentForm: AssessmentFormState = {
  title: "",
  description: "",
  type: "QUIZ",
  passingScore: "70",
  timeLimitMinutes: "",
  maxAttempts: "",
};

type LocalContest = {
  id: string;
  title: string;
  courseTitle: string;
  startDate: string;
  endDate: string;
  description: string;
};

function contestStatus(contest: LocalContest) {
  const now = Date.now();
  const start = new Date(contest.startDate).getTime();
  const end = new Date(contest.endDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return "DRAFT";
  if (now < start) return "SCHEDULED";
  if (now > end) return "ENDED";
  return "LIVE";
}

function contestTone(status: string) {
  if (status === "LIVE") return "is-live";
  if (status === "SCHEDULED") return "is-draft";
  return "is-muted";
}

function QuestionsPanel({ assessmentId, initialQuestions }: { assessmentId: string; initialQuestions: AdminAssessmentResponse["questions"] }) {
  const [questions, setQuestions] = useState(initialQuestions || []);
  const [adding, setAdding] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [points, setPoints] = useState("1");
  const [options, setOptions] = useState<AdminOptionInput[]>([
    { optionText: "", correct: true },
    { optionText: "", correct: false },
  ]);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  function updateOption(index: number, patch: Partial<AdminOptionInput>) {
    setOptions((prev) => prev.map((option, i) => (i === index ? { ...option, ...patch } : option)));
  }

  function addOptionRow() {
    setOptions((prev) => [...prev, { optionText: "", correct: false }]);
  }

  function removeOptionRow(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  async function submitQuestion() {
    const cleanOptions = options.filter((option) => option.optionText.trim());
    if (!questionText.trim() || cleanOptions.length < 2) return;

    setQuestionsError(null);
    try {
      const created = await createQuestion(assessmentId, {
        questionText: questionText.trim(),
        questionType: "MULTIPLE_CHOICE",
        points: Number(points) || 1,
        orderIndex: questions.length,
        options: cleanOptions,
      });

      if (created) {
        setQuestions((prev) => [...(prev || []), created]);
        setQuestionText("");
        setPoints("1");
        setOptions([{ optionText: "", correct: true }, { optionText: "", correct: false }]);
        setAdding(false);
      }
    } catch (err) {
      setQuestionsError(err instanceof Error ? err.message : "Could not save the question.");
    }
  }

  async function removeQuestion(questionId: string, questionText: string) {
    if (!window.confirm(`Delete question "${questionText}"?`)) return;
    setQuestionsError(null);
    try {
      await deleteQuestion(questionId);
      setQuestions((prev) => (prev || []).filter((question) => question.id !== questionId));
    } catch (err) {
      setQuestionsError(err instanceof Error ? err.message : "Could not delete the question.");
    }
  }

  return (
    <div className="admin-questions-panel">
      {questionsError && <div className="admin-error-banner">{questionsError}</div>}
      {(questions || []).map((question, index) => (
        <div className="admin-question-row" key={question.id}>
          <div>
            <strong>{index + 1}. {question.questionText}</strong>
            <small>{(question.options || []).length} options - {question.points ?? 1} pt{(question.points ?? 1) === 1 ? "" : "s"}</small>
          </div>
          <button
            type="button"
            className="admin-icon-danger"
            aria-label={`Delete question ${question.questionText}`}
            onClick={() => removeQuestion(question.id, question.questionText)}
          >
            <Trash2 size={14} strokeWidth={2} />
          </button>
        </div>
      ))}

      {!questions?.length && !adding && <p className="admin-empty">No questions yet - add the first one below.</p>}

      {adding ? (
        <div className="admin-question-builder">
          <input
            type="text"
            placeholder="Question text"
            value={questionText}
            onChange={(event) => setQuestionText(event.target.value)}
          />
          <label className="admin-inline-label">
            <span>Points</span>
            <input type="number" min={1} value={points} onChange={(event) => setPoints(event.target.value)} />
          </label>

          {options.map((option, index) => (
            <div className="admin-option-row" key={index}>
              <input
                type="checkbox"
                checked={option.correct}
                onChange={(event) => updateOption(index, { correct: event.target.checked })}
                aria-label="Correct answer"
              />
              <input
                type="text"
                placeholder={`Option ${index + 1}`}
                value={option.optionText}
                onChange={(event) => updateOption(index, { optionText: event.target.value })}
              />
              {options.length > 2 && (
                <button type="button" className="admin-icon-danger" onClick={() => removeOptionRow(index)}>
                  <X size={13} strokeWidth={2} />
                </button>
              )}
            </div>
          ))}

          <div className="admin-question-builder-actions">
            <button type="button" className="admin-ghost-btn" onClick={addOptionRow}>
              <Plus size={13} strokeWidth={2} /> Add option
            </button>
            <div>
              <button type="button" className="admin-ghost-btn" onClick={() => setAdding(false)}>Cancel</button>
              <button type="button" className="admin-primary-btn" onClick={submitQuestion}>Save question</button>
            </div>
          </div>
        </div>
      ) : (
        <button type="button" className="admin-add-module-btn" onClick={() => setAdding(true)}>
          <Plus size={14} strokeWidth={2} /> Add question
        </button>
      )}
    </div>
  );
}

function QuizzesTab() {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [courseId, setCourseId] = useState("");
  const [assessments, setAssessments] = useState<AdminAssessmentResponse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<AssessmentFormState>(emptyAssessmentForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminCourses(0, 100, "")
      .then((page) => {
        const rows = page?.content || [];
        setCourses(rows);
        if (rows.length) setCourseId(rows[0].id);
      })
      .catch(() => setError("Could not load courses."))
      .finally(() => setLoadingCourses(false));
  }, []);

  function reloadAssessments(id: string) {
    setLoadingAssessments(true);
    getAssessmentsByCourse(id)
      .then(setAssessments)
      .catch(() => setAssessments([]))
      .finally(() => setLoadingAssessments(false));
  }

  useEffect(() => {
    if (courseId) reloadAssessments(courseId);
  }, [courseId]);

  async function submitAssessment() {
    if (!form.title.trim() || !courseId) return;
    setSaving(true);
    setError(null);
    try {
      await createAssessment({
        title: form.title.trim(),
        description: form.description || undefined,
        courseId,
        type: form.type,
        passingScore: form.passingScore ? Number(form.passingScore) : undefined,
        timeLimitMinutes: form.timeLimitMinutes ? Number(form.timeLimitMinutes) : undefined,
        maxAttempts: form.maxAttempts ? Number(form.maxAttempts) : undefined,
      });
      setModalOpen(false);
      setForm(emptyAssessmentForm);
      reloadAssessments(courseId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the quiz.");
    } finally {
      setSaving(false);
    }
  }

  async function removeAssessment(assessmentId: string) {
    if (!window.confirm("Delete this quiz and all of its questions?")) return;
    await deleteAssessment(assessmentId).catch(() => undefined);
    reloadAssessments(courseId);
  }

  return (
    <>
      <div className="admin-toolbar">
        <label className="admin-org-select">
          <span>Course</span>
          <select value={courseId} onChange={(event) => setCourseId(event.target.value)} disabled={loadingCourses || !courses.length}>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </label>
        <button type="button" className="admin-primary-btn" onClick={() => setModalOpen(true)} disabled={!courseId}>
          <Plus size={16} strokeWidth={2} /> New quiz
        </button>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      {loadingCourses || loadingAssessments ? (
        <div className="admin-stat-grid">
          {Array.from({ length: 2 }, (_, index) => <CardSkeleton key={index} lines={3} />)}
        </div>
      ) : assessments.length ? (
        <div className="admin-course-card-list">
          {assessments.map((assessment) => (
            <article className="admin-course-card" key={assessment.id}>
              <div className="admin-course-card-row" onClick={() => setExpanded(expanded === assessment.id ? null : assessment.id)}>
                <button type="button" className="admin-expand-toggle" aria-label="Toggle questions">
                  {expanded === assessment.id ? <ChevronDown size={16} strokeWidth={2} /> : <ChevronRight size={16} strokeWidth={2} />}
                </button>
                <div className="admin-course-card-title">
                  <strong>{assessment.title}</strong>
                  <span>{(assessment.questions || []).length} question{(assessment.questions || []).length === 1 ? "" : "s"} - pass {assessment.passingScore ?? 70}%</span>
                </div>
                <span className="admin-badge is-draft">{assessment.type || "QUIZ"}</span>
                <span className="admin-course-card-meta">{assessment.timeLimitMinutes ? `${assessment.timeLimitMinutes} min` : "No limit"}</span>
                <div className="admin-course-card-actions" onClick={(event) => event.stopPropagation()}>
                  <button type="button" className="admin-icon-danger" onClick={() => removeAssessment(assessment.id)} aria-label="Delete quiz">
                    <Trash2 size={15} strokeWidth={1.8} />
                  </button>
                </div>
              </div>

              {expanded === assessment.id && (
                <div className="admin-course-card-content">
                  <div className="admin-panel-heading">
                    <div>
                      <ListChecks size={16} strokeWidth={1.8} />
                      <h2>Questions</h2>
                    </div>
                  </div>
                  <QuestionsPanel assessmentId={assessment.id} initialQuestions={assessment.questions} />
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="admin-empty">No quizzes for this course yet.</p>
      )}

      {modalOpen && (
        <div className="admin-drawer-overlay" onClick={() => !saving && setModalOpen(false)}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <header>
              <h2>New quiz</h2>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="Close">
                <X size={18} strokeWidth={1.8} />
              </button>
            </header>

            <div className="admin-form-grid">
              <label className="admin-form-span-2">
                <span>Title</span>
                <input type="text" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
              </label>
              <label className="admin-form-span-2">
                <span>Description</span>
                <textarea rows={2} value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
              </label>
              <label>
                <span>Type</span>
                <select value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as AssessmentFormState["type"] }))}>
                  {["QUIZ", "MCQ", "ASSIGNMENT", "CODING"].map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Passing score (%)</span>
                <input type="number" value={form.passingScore} onChange={(event) => setForm((prev) => ({ ...prev, passingScore: event.target.value }))} />
              </label>
              <label>
                <span>Time limit (minutes)</span>
                <input type="number" value={form.timeLimitMinutes} onChange={(event) => setForm((prev) => ({ ...prev, timeLimitMinutes: event.target.value }))} />
              </label>
              <label>
                <span>Max attempts</span>
                <input type="number" value={form.maxAttempts} onChange={(event) => setForm((prev) => ({ ...prev, maxAttempts: event.target.value }))} />
              </label>
            </div>

            <footer>
              <button type="button" className="admin-ghost-btn" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button>
              <button type="button" className="admin-primary-btn" onClick={submitAssessment} disabled={saving || !form.title.trim()}>
                {saving ? "Saving..." : "Create quiz"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

function ContestsTab() {
  const [contests, setContests] = useState<LocalContest[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", courseTitle: "", startDate: "", endDate: "", description: "" });

  function submitContest() {
    if (!form.title.trim()) return;
    setContests((prev) => [
      { id: `contest-${Date.now()}`, ...form },
      ...prev,
    ]);
    setForm({ title: "", courseTitle: "", startDate: "", endDate: "", description: "" });
    setModalOpen(false);
  }

  function removeContest(id: string) {
    setContests((prev) => prev.filter((contest) => contest.id !== id));
  }

  return (
    <>
      <div className="admin-toolbar">
        <p className="admin-panel-caption is-flush">
          Contests have no backend yet - entries below are kept locally in this browser session only.
        </p>
        <button type="button" className="admin-primary-btn" onClick={() => setModalOpen(true)}>
          <Plus size={16} strokeWidth={2} /> New contest
        </button>
      </div>

      {contests.length ? (
        <div className="admin-course-card-list">
          {contests.map((contest) => {
            const status = contestStatus(contest);
            return (
              <article className="admin-course-card" key={contest.id}>
                <div className="admin-course-card-row">
                  <span className="admin-expand-toggle" aria-hidden="true"><Trophy size={16} strokeWidth={1.8} /></span>
                  <div className="admin-course-card-title">
                    <strong>{contest.title}</strong>
                    <span>{contest.courseTitle || "No linked course"} - {contest.startDate || "TBD"} to {contest.endDate || "TBD"}</span>
                  </div>
                  <span className={`admin-badge ${contestTone(status)}`}>{status}</span>
                  <div className="admin-course-card-actions">
                    <button type="button" className="admin-icon-danger" onClick={() => removeContest(contest.id)} aria-label="Remove contest">
                      <Trash2 size={15} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="admin-empty">No contests set up yet.</p>
      )}

      {modalOpen && (
        <div className="admin-drawer-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <header>
              <h2>New contest</h2>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="Close">
                <X size={18} strokeWidth={1.8} />
              </button>
            </header>
            <div className="admin-form-grid">
              <label className="admin-form-span-2">
                <span>Title</span>
                <input type="text" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
              </label>
              <label className="admin-form-span-2">
                <span>Linked course (optional)</span>
                <input type="text" value={form.courseTitle} onChange={(event) => setForm((prev) => ({ ...prev, courseTitle: event.target.value }))} />
              </label>
              <label>
                <span>Start date</span>
                <input type="date" value={form.startDate} onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))} />
              </label>
              <label>
                <span>End date</span>
                <input type="date" value={form.endDate} onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))} />
              </label>
              <label className="admin-form-span-2">
                <span>Description</span>
                <textarea rows={2} value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
              </label>
            </div>
            <footer>
              <button type="button" className="admin-ghost-btn" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="button" className="admin-primary-btn" onClick={submitContest} disabled={!form.title.trim()}>Create contest</button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

function QuizzesContent() {
  const [admin, setAdmin] = useState<UserResponse | null>(null);
  const [tab, setTab] = useState<"quizzes" | "contests">("quizzes");
  const session = getAuthSession();
  const role = session?.role || "";

  useEffect(() => {
    getCurrentUser().then(setAdmin).catch(() => undefined);
  }, []);

  return (
    <main className="admin-shell">
      <AdminSidebar activeHref="/admin-7f3k9x2q/quizzes" role={role} admin={admin} />

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">Ops Console</span>
            <h1>Quiz &amp; Contests</h1>
            <p>Build assessments per course and manage contests.</p>
          </div>
        </header>

        <div className="admin-tabs">
          <button type="button" className={tab === "quizzes" ? "active" : ""} onClick={() => setTab("quizzes")}>
            <ListChecks size={15} strokeWidth={1.8} /> Quiz creation &amp; management
          </button>
          <button type="button" className={tab === "contests" ? "active" : ""} onClick={() => setTab("contests")}>
            <Award size={15} strokeWidth={1.8} /> Contests
          </button>
        </div>

        {tab === "quizzes" ? <QuizzesTab /> : <ContestsTab />}
      </section>
    </main>
  );
}

export default function QuizzesPage() {
  return (
    <AdminGuard>
      <QuizzesContent />
    </AdminGuard>
  );
}
