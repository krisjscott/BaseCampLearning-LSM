"use client";

import {
  Archive,
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileCheck,
  Layers,
  Pencil,
  Plus,
  Rocket,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import AdminGuard from "../components/AdminGuard";
import AdminSidebar from "../components/AdminSidebar";
import { CardSkeleton } from "../components/Skeleton";
import { useToast } from "../components/Toast";
import { getAuthSession, getCurrentUser, LessonResponse, UserResponse } from "../lib/backendApi";
import {
  AdminCourseResponse,
  AdminReadingContentResponse,
  AssignmentSubmissionResponse,
  CategoryResponse,
  CreateLessonRequest,
  CreateModuleRequest,
  ModuleResponse,
  UpdateLessonRequest,
  UpdateModuleRequest,
  archiveCourse,
  createCourse,
  createLesson,
  createModule,
  createReadingContent,
  deleteCourse,
  deleteLesson,
  deleteModule,
  getAdminCourses,
  getCategories,
  getCourseModules,
  getLessonSubmissions,
  getReadingContent,
  gradeSubmission,
  publishCourse,
  reorderLessons,
  reorderModules,
  updateCourse,
  updateLesson,
  updateModule,
  updateReadingContent,
  uploadLessonCaptions,
  uploadLessonDocument,
  uploadLessonVideo,
} from "../lib/adminApi";

const READING_CONTENT_TYPES = new Set(["ARTICLE"]);

type CourseFormState = {
  title: string;
  description: string;
  thumbnailUrl: string;
  categoryId: string;
  visibility: "PUBLIC" | "ORGANIZATION";
  durationHours: string;
  price: string;
};

const emptyForm: CourseFormState = {
  title: "",
  description: "",
  thumbnailUrl: "",
  categoryId: "",
  visibility: "PUBLIC",
  durationHours: "",
  price: "",
};

function statusTone(status?: string | null) {
  const normalized = (status || "").toLowerCase();
  if (normalized === "published") return "is-live";
  if (normalized === "draft") return "is-draft";
  if (normalized === "archived") return "is-muted";
  return "";
}

function flattenCategories(categories: CategoryResponse[]): CategoryResponse[] {
  return categories.flatMap((category) => [category, ...flattenCategories(category.subcategories || [])]);
}

function ReadingContentEditor({ lesson }: { lesson: LessonResponse }) {
  const [content, setContent] = useState<AdminReadingContentResponse | null>(null);
  const [form, setForm] = useState({ title: lesson.title, contentMarkdown: "", estimatedReadingMinutes: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    let active = true;
    getReadingContent(lesson.id)
      .then((existing) => {
        if (!active) return;
        setContent(existing);
        if (existing) {
          setForm({
            title: existing.title,
            contentMarkdown: existing.contentMarkdown || "",
            estimatedReadingMinutes: existing.estimatedReadingMinutes != null ? String(existing.estimatedReadingMinutes) : "",
          });
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const basePayload = {
        title: form.title.trim(),
        contentMarkdown: form.contentMarkdown || undefined,
        estimatedReadingMinutes: form.estimatedReadingMinutes ? Number(form.estimatedReadingMinutes) : undefined,
      };
      const saved = content
        ? await updateReadingContent(content.id, basePayload)
        : await createReadingContent({ ...basePayload, lessonId: lesson.id });
      setContent(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save reading content.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <CardSkeleton lines={2} />;

  return (
    <div className="admin-reading-content-editor">
      {error && <div className="admin-error-banner">{error}</div>}
      <label>
        <span>Reading title</span>
        <input
          type="text"
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
        />
      </label>
      <label>
        <div className="admin-markdown-label-row">
          <span>Content (Markdown - LaTeX via $...$ or $$...$$)</span>
          <button type="button" className="admin-ghost-btn" onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? "Edit" : "Preview"}
          </button>
        </div>
        {showPreview ? (
          <div className="admin-markdown-preview reading-lesson-markdown">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {form.contentMarkdown || "*Nothing to preview yet*"}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            rows={8}
            value={form.contentMarkdown}
            onChange={(event) => setForm((prev) => ({ ...prev, contentMarkdown: event.target.value }))}
            placeholder={"## Lesson reading content\n\nWrite in **Markdown**. Math example: $E = mc^2$"}
          />
        )}
      </label>
      <label>
        <span>Estimated reading time (minutes)</span>
        <input
          type="number"
          value={form.estimatedReadingMinutes}
          onChange={(event) => setForm((prev) => ({ ...prev, estimatedReadingMinutes: event.target.value }))}
        />
      </label>
      <button type="button" className="admin-primary-btn" onClick={handleSave} disabled={saving}>
        <Save size={14} strokeWidth={2} /> {saving ? "Saving..." : content ? "Update reading content" : "Create reading content"}
      </button>
    </div>
  );
}

function SubmissionsPanel({ lesson }: { lesson: LessonResponse }) {
  const toast = useToast();
  const [submissions, setSubmissions] = useState<AssignmentSubmissionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, { score: string; feedback: string }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reload() {
    setLoading(true);
    getLessonSubmissions(lesson.id)
      .then((rows) => {
        setSubmissions(rows);
        setDrafts(Object.fromEntries(rows.map((row) => [row.id, { score: row.score != null ? String(row.score) : "", feedback: row.feedback || "" }])));
      })
      .catch(() => setError("Could not load submissions."))
      .finally(() => setLoading(false));
  }

  useEffect(reload, [lesson.id]);

  async function saveGrade(submissionId: string) {
    const draft = drafts[submissionId];
    if (!draft || draft.score === "") return;
    setSavingId(submissionId);
    setError(null);
    try {
      await gradeSubmission(submissionId, Number(draft.score), draft.feedback || undefined);
      toast.success("Grade saved");
      reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save the grade.";
      setError(message);
      toast.error(message);
    } finally {
      setSavingId(null);
    }
  }

  if (loading) return <CardSkeleton lines={2} />;

  return (
    <div className="admin-reading-content-editor">
      {error && <div className="admin-error-banner">{error}</div>}
      {submissions.length ? (
        submissions.map((submission) => (
          <div className="admin-submission-row" key={submission.id}>
            <div className="admin-submission-header">
              <strong>{submission.userName || "Learner"}</strong>
              <span className={`admin-badge ${submission.status === "GRADED" ? "is-live" : "is-draft"}`}>{submission.status}</span>
            </div>
            {submission.submissionText && <p className="admin-submission-text">{submission.submissionText}</p>}
            {submission.fileUrl && (
              <a href={submission.fileUrl} target="_blank" rel="noreferrer">View submitted file -&gt;</a>
            )}
            <div className="admin-inline-form">
              <input
                type="number"
                placeholder="Score"
                min={0}
                max={100}
                value={drafts[submission.id]?.score || ""}
                onChange={(event) => setDrafts((prev) => ({ ...prev, [submission.id]: { ...prev[submission.id], score: event.target.value } }))}
              />
              <input
                type="text"
                placeholder="Feedback (optional)"
                value={drafts[submission.id]?.feedback || ""}
                onChange={(event) => setDrafts((prev) => ({ ...prev, [submission.id]: { ...prev[submission.id], feedback: event.target.value } }))}
              />
              <button type="button" onClick={() => saveGrade(submission.id)} disabled={savingId === submission.id || !drafts[submission.id]?.score}>
                {savingId === submission.id ? "Saving..." : "Save grade"}
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="admin-empty">No submissions yet for this assignment.</p>
      )}
    </div>
  );
}

function ModulesPanel({ courseId }: { courseId: string }) {
  const toast = useToast();
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingModule, setAddingModule] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: "", contentType: "VIDEO", durationMinutes: "" });
  const [panelError, setPanelError] = useState<string | null>(null);

  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleEditForm, setModuleEditForm] = useState({ title: "", description: "" });
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonEditForm, setLessonEditForm] = useState({ title: "", contentType: "VIDEO", durationMinutes: "", contentUrl: "" });
  const [readingContentFor, setReadingContentFor] = useState<string | null>(null);
  const [submissionsFor, setSubmissionsFor] = useState<string | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  function reload() {
    setLoading(true);
    getCourseModules(courseId)
      .then((rows) => setModules(rows))
      .catch(() => setModules([]))
      .finally(() => setLoading(false));
  }

  useEffect(reload, [courseId]);

  function startEditModule(module: ModuleResponse) {
    setEditingModuleId(module.id);
    setModuleEditForm({ title: module.title, description: module.description || "" });
  }

  async function saveModuleEdit(moduleId: string) {
    if (!moduleEditForm.title.trim()) return;
    const payload: UpdateModuleRequest = { title: moduleEditForm.title.trim(), description: moduleEditForm.description || undefined };
    setPanelError(null);
    try {
      await updateModule(moduleId, payload);
      setEditingModuleId(null);
      reload();
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : "Could not update the module.");
    }
  }

  async function moveModule(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= modules.length) return;
    const reordered = [...modules];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setPanelError(null);
    try {
      await reorderModules(courseId, reordered.map((module, i) => ({ id: module.id, orderIndex: i })));
      reload();
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : "Could not reorder modules.");
    }
  }

  function startEditLesson(lesson: LessonResponse) {
    setEditingLessonId(lesson.id);
    setLessonEditForm({
      title: lesson.title,
      contentType: lesson.contentType || "VIDEO",
      durationMinutes: lesson.durationMinutes != null ? String(lesson.durationMinutes) : "",
      contentUrl: lesson.contentUrl || "",
    });
  }

  async function saveLessonEdit(lessonId: string) {
    if (!lessonEditForm.title.trim()) return;
    const payload: UpdateLessonRequest = {
      title: lessonEditForm.title.trim(),
      contentType: lessonEditForm.contentType as UpdateLessonRequest["contentType"],
      durationMinutes: lessonEditForm.durationMinutes ? Number(lessonEditForm.durationMinutes) : undefined,
      contentUrl: lessonEditForm.contentUrl || undefined,
    };
    setPanelError(null);
    try {
      await updateLesson(lessonId, payload);
      setEditingLessonId(null);
      reload();
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : "Could not update the lesson.");
    }
  }

  async function handleVideoUpload(lessonId: string, file: File) {
    setUploadingFor(lessonId);
    setPanelError(null);
    try {
      await uploadLessonVideo(lessonId, file);
      toast.success("Video uploaded");
      reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not upload the video.";
      setPanelError(message);
      toast.error(message);
    } finally {
      setUploadingFor(null);
    }
  }

  async function handleCaptionsUpload(lessonId: string, file: File) {
    setUploadingFor(lessonId);
    setPanelError(null);
    try {
      await uploadLessonCaptions(lessonId, file);
      toast.success("Captions uploaded");
      reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not upload captions.";
      setPanelError(message);
      toast.error(message);
    } finally {
      setUploadingFor(null);
    }
  }

  async function handleDocumentUpload(lessonId: string, file: File) {
    setUploadingFor(lessonId);
    setPanelError(null);
    try {
      await uploadLessonDocument(lessonId, file);
      toast.success("Document uploaded");
      reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not upload the document.";
      setPanelError(message);
      toast.error(message);
    } finally {
      setUploadingFor(null);
    }
  }

  async function moveLesson(module: ModuleResponse, index: number, direction: -1 | 1) {
    const lessons = module.lessons || [];
    const target = index + direction;
    if (target < 0 || target >= lessons.length) return;
    const reordered = [...lessons];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setPanelError(null);
    try {
      await reorderLessons(module.id, reordered.map((lesson, i) => ({ id: lesson.id, orderIndex: i })));
      reload();
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : "Could not reorder lessons.");
    }
  }

  async function submitModule() {
    if (!moduleTitle.trim()) return;
    const payload: CreateModuleRequest = { title: moduleTitle.trim(), courseId, orderIndex: modules.length };
    setPanelError(null);
    try {
      await createModule(payload);
      setModuleTitle("");
      setAddingModule(false);
      reload();
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : "Could not create the module.");
    }
  }

  async function submitLesson(moduleId: string) {
    if (!lessonForm.title.trim()) return;
    const payload: CreateLessonRequest = {
      title: lessonForm.title.trim(),
      moduleId,
      contentType: lessonForm.contentType as CreateLessonRequest["contentType"],
      durationMinutes: lessonForm.durationMinutes ? Number(lessonForm.durationMinutes) : undefined,
      orderIndex: (modules.find((module) => module.id === moduleId)?.lessons || []).length,
    };
    setPanelError(null);
    try {
      await createLesson(payload);
      setLessonForm({ title: "", contentType: "VIDEO", durationMinutes: "" });
      setAddingLessonTo(null);
      reload();
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : "Could not create the lesson.");
    }
  }

  async function removeModule(moduleId: string, title: string) {
    if (!window.confirm(`Delete module "${title}" and all of its lessons?`)) return;
    setPanelError(null);
    try {
      await deleteModule(moduleId);
      reload();
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : "Could not delete the module.");
    }
  }

  async function removeLesson(lessonId: string, title: string) {
    if (!window.confirm(`Delete lesson "${title}"?`)) return;
    setPanelError(null);
    try {
      await deleteLesson(lessonId);
      reload();
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : "Could not delete the lesson.");
    }
  }

  if (loading) return <CardSkeleton lines={3} />;

  return (
    <div className="admin-modules-panel">
      {panelError && <div className="admin-error-banner">{panelError}</div>}
      {modules.map((module, moduleIndex) => (
        <div className="admin-module-row" key={module.id}>
          <div className="admin-module-heading">
            {editingModuleId === module.id ? (
              <div className="admin-inline-form admin-inline-form-grow">
                <input
                  type="text"
                  value={moduleEditForm.title}
                  onChange={(event) => setModuleEditForm((prev) => ({ ...prev, title: event.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={moduleEditForm.description}
                  onChange={(event) => setModuleEditForm((prev) => ({ ...prev, description: event.target.value }))}
                />
                <button type="button" onClick={() => saveModuleEdit(module.id)}>Save</button>
                <button type="button" className="admin-ghost-btn" onClick={() => setEditingModuleId(null)}>Cancel</button>
              </div>
            ) : (
              <strong>{module.title}</strong>
            )}
            <div>
              <button
                type="button"
                className="admin-icon-btn"
                aria-label={`Move ${module.title} up`}
                disabled={moduleIndex === 0}
                onClick={() => moveModule(moduleIndex, -1)}
              >
                <ArrowUp size={13} strokeWidth={2} />
              </button>
              <button
                type="button"
                className="admin-icon-btn"
                aria-label={`Move ${module.title} down`}
                disabled={moduleIndex === modules.length - 1}
                onClick={() => moveModule(moduleIndex, 1)}
              >
                <ArrowDown size={13} strokeWidth={2} />
              </button>
              <button type="button" onClick={() => startEditModule(module)}>
                <Pencil size={13} strokeWidth={2} /> Edit
              </button>
              <button type="button" onClick={() => setAddingLessonTo(addingLessonTo === module.id ? null : module.id)}>
                <Plus size={13} strokeWidth={2} /> Lesson
              </button>
              <button
                type="button"
                className="admin-icon-danger"
                aria-label={`Delete module ${module.title}`}
                onClick={() => removeModule(module.id, module.title)}
              >
                <Trash2 size={13} strokeWidth={2} />
              </button>
            </div>
          </div>

          {(module.lessons || []).map((lesson, lessonIndex) => (
            <div key={lesson.id}>
              {editingLessonId === lesson.id ? (
                <div className="admin-inline-form">
                  <input
                    type="text"
                    value={lessonEditForm.title}
                    onChange={(event) => setLessonEditForm((prev) => ({ ...prev, title: event.target.value }))}
                  />
                  <select
                    value={lessonEditForm.contentType}
                    onChange={(event) => setLessonEditForm((prev) => ({ ...prev, contentType: event.target.value }))}
                  >
                    {["VIDEO", "DOCUMENT", "QUIZ", "ASSIGNMENT", "ARTICLE", "INTERACTIVE"].map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Minutes"
                    value={lessonEditForm.durationMinutes}
                    onChange={(event) => setLessonEditForm((prev) => ({ ...prev, durationMinutes: event.target.value }))}
                  />
                  {lessonEditForm.contentType === "VIDEO" ? (
                    <>
                      <label className="admin-file-label">
                        <span>{lesson.contentUrl ? "Replace video" : "Upload video"}</span>
                        <input
                          type="file"
                          accept="video/*"
                          disabled={uploadingFor === lesson.id}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) handleVideoUpload(lesson.id, file);
                            event.target.value = "";
                          }}
                        />
                      </label>
                      <label className="admin-file-label">
                        <span>{lesson.captionsUrl ? "Replace captions" : "Upload captions (.vtt/.srt)"}</span>
                        <input
                          type="file"
                          accept=".vtt,.srt"
                          disabled={uploadingFor === lesson.id}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) handleCaptionsUpload(lesson.id, file);
                            event.target.value = "";
                          }}
                        />
                      </label>
                      {uploadingFor === lesson.id && <span className="field-note">Uploading...</span>}
                    </>
                  ) : lessonEditForm.contentType === "DOCUMENT" ? (
                    <>
                      <label className="admin-file-label">
                        <span>{lesson.contentUrl ? "Replace document" : "Upload document"}</span>
                        <input
                          type="file"
                          disabled={uploadingFor === lesson.id}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) handleDocumentUpload(lesson.id, file);
                            event.target.value = "";
                          }}
                        />
                      </label>
                      {uploadingFor === lesson.id && <span className="field-note">Uploading...</span>}
                    </>
                  ) : lessonEditForm.contentType === "ARTICLE" ? (
                    <span className="field-note">Use the reading content (book) icon below to write this article in Markdown.</span>
                  ) : (
                    <input
                      type="text"
                      placeholder="Content URL"
                      value={lessonEditForm.contentUrl}
                      onChange={(event) => setLessonEditForm((prev) => ({ ...prev, contentUrl: event.target.value }))}
                    />
                  )}
                  <button type="button" onClick={() => saveLessonEdit(lesson.id)}>Save</button>
                  <button type="button" className="admin-ghost-btn" onClick={() => setEditingLessonId(null)}>Cancel</button>
                </div>
              ) : (
                <div className="admin-lesson-row">
                  <span>{lesson.title}</span>
                  <small>{lesson.contentType || "CONTENT"}{lesson.durationMinutes ? ` - ${lesson.durationMinutes}m` : ""}</small>
                  <button
                    type="button"
                    className="admin-icon-btn"
                    aria-label={`Move ${lesson.title} up`}
                    disabled={lessonIndex === 0}
                    onClick={() => moveLesson(module, lessonIndex, -1)}
                  >
                    <ArrowUp size={13} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    className="admin-icon-btn"
                    aria-label={`Move ${lesson.title} down`}
                    disabled={lessonIndex === (module.lessons || []).length - 1}
                    onClick={() => moveLesson(module, lessonIndex, 1)}
                  >
                    <ArrowDown size={13} strokeWidth={2} />
                  </button>
                  <button type="button" className="admin-icon-btn" aria-label={`Edit ${lesson.title}`} onClick={() => startEditLesson(lesson)}>
                    <Pencil size={13} strokeWidth={2} />
                  </button>
                  {READING_CONTENT_TYPES.has((lesson.contentType || "").toUpperCase()) && (
                    <button
                      type="button"
                      className="admin-icon-btn"
                      aria-label={`Reading content for ${lesson.title}`}
                      onClick={() => setReadingContentFor(readingContentFor === lesson.id ? null : lesson.id)}
                    >
                      <BookOpen size={13} strokeWidth={2} />
                    </button>
                  )}
                  {(lesson.contentType || "").toUpperCase() === "ASSIGNMENT" && (
                    <button
                      type="button"
                      className="admin-icon-btn"
                      aria-label={`Submissions for ${lesson.title}`}
                      onClick={() => setSubmissionsFor(submissionsFor === lesson.id ? null : lesson.id)}
                    >
                      <FileCheck size={13} strokeWidth={2} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="admin-icon-danger"
                    aria-label={`Delete lesson ${lesson.title}`}
                    onClick={() => removeLesson(lesson.id, lesson.title)}
                  >
                    <Trash2 size={13} strokeWidth={2} />
                  </button>
                </div>
              )}
              {readingContentFor === lesson.id && <ReadingContentEditor lesson={lesson} />}
              {submissionsFor === lesson.id && <SubmissionsPanel lesson={lesson} />}
            </div>
          ))}

          {addingLessonTo === module.id && (
            <div className="admin-inline-form">
              <input
                type="text"
                placeholder="Lesson title"
                value={lessonForm.title}
                onChange={(event) => setLessonForm((prev) => ({ ...prev, title: event.target.value }))}
              />
              <select
                value={lessonForm.contentType}
                onChange={(event) => setLessonForm((prev) => ({ ...prev, contentType: event.target.value }))}
              >
                {["VIDEO", "DOCUMENT", "QUIZ", "ASSIGNMENT", "ARTICLE", "INTERACTIVE"].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Minutes"
                value={lessonForm.durationMinutes}
                onChange={(event) => setLessonForm((prev) => ({ ...prev, durationMinutes: event.target.value }))}
              />
              <button type="button" onClick={() => submitLesson(module.id)}>Add</button>
            </div>
          )}
        </div>
      ))}

      {addingModule ? (
        <div className="admin-inline-form">
          <input
            type="text"
            placeholder="Module title"
            value={moduleTitle}
            onChange={(event) => setModuleTitle(event.target.value)}
          />
          <button type="button" onClick={submitModule}>Add</button>
          <button type="button" className="admin-ghost-btn" onClick={() => setAddingModule(false)}>Cancel</button>
        </div>
      ) : (
        <button type="button" className="admin-add-module-btn" onClick={() => setAddingModule(true)}>
          <Plus size={14} strokeWidth={2} /> Add module
        </button>
      )}

      {!modules.length && !addingModule && <p className="admin-empty">No modules yet - add the first one above.</p>}
    </div>
  );
}

function CoursesContent() {
  const toast = useToast();
  const [admin, setAdmin] = useState<UserResponse | null>(null);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [courses, setCourses] = useState<AdminCourseResponse[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AdminCourseResponse | null>(null);
  const [form, setForm] = useState<CourseFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const session = getAuthSession();
  const role = session?.role || "";
  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

  function reloadCourses() {
    setLoading(true);
    setError(null);
    getAdminCourses(0, 100, query)
      .then((page) => setCourses(page?.content || []))
      .catch(() => setError("Could not load courses."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    getCurrentUser().then(setAdmin).catch(() => undefined);
    getCategories().then(setCategories).catch(() => undefined);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(reloadCourses, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const filtered = useMemo(() => {
    if (statusFilter === "ALL") return courses;
    return courses.filter((course) => (course.status || "").toUpperCase() === statusFilter);
  }, [courses, statusFilter]);

  function openCreate() {
    setEditingCourse(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(course: AdminCourseResponse) {
    setEditingCourse(course);
    setForm({
      title: course.title || "",
      description: course.description || "",
      thumbnailUrl: course.thumbnailUrl || "",
      categoryId: "",
      visibility: (course.visibility as CourseFormState["visibility"]) || "PUBLIC",
      durationHours: course.durationHours != null ? String(course.durationHours) : "",
      price: course.price != null ? String(course.price) : "",
    });
    setModalOpen(true);
  }

  async function submitForm() {
    if (!form.title.trim()) return;
    setSaving(true);
    setError(null);

    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, {
          title: form.title.trim(),
          description: form.description || undefined,
          thumbnailUrl: form.thumbnailUrl || undefined,
          visibility: form.visibility,
          durationHours: form.durationHours ? Number(form.durationHours) : undefined,
          price: form.price ? Number(form.price) : undefined,
        });
      } else {
        if (!form.categoryId) throw new Error("Choose a category before creating the course.");
        await createCourse({
          title: form.title.trim(),
          description: form.description || undefined,
          thumbnailUrl: form.thumbnailUrl || undefined,
          categoryId: form.categoryId,
          visibility: form.visibility,
          status: "DRAFT",
          durationHours: form.durationHours ? Number(form.durationHours) : undefined,
          price: form.price ? Number(form.price) : undefined,
        });
      }
      setModalOpen(false);
      toast.success(editingCourse ? "Course updated" : "Course created");
      reloadCourses();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save the course.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(course: AdminCourseResponse) {
    setError(null);
    try {
      await publishCourse(course.id);
      toast.success(`"${course.title}" published`);
      reloadCourses();
    } catch (err) {
      const message = err instanceof Error ? err.message : `Could not publish "${course.title}".`;
      setError(message);
      toast.error(message);
    }
  }

  async function handleArchive(course: AdminCourseResponse) {
    setError(null);
    try {
      await archiveCourse(course.id);
      toast.success(`"${course.title}" archived`);
      reloadCourses();
    } catch (err) {
      const message = err instanceof Error ? err.message : `Could not archive "${course.title}".`;
      setError(message);
      toast.error(message);
    }
  }

  async function handleDelete(course: AdminCourseResponse) {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    setError(null);
    try {
      await deleteCourse(course.id);
      toast.success(`"${course.title}" deleted`);
      reloadCourses();
    } catch (err) {
      const message = err instanceof Error ? err.message : `Could not delete "${course.title}".`;
      setError(message);
      toast.error(message);
    }
  }

  return (
    <main className="admin-shell">
      <AdminSidebar activeHref="/courses" role={role} admin={admin} />

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">Ops Console</span>
            <h1>Courses</h1>
            <p>Create and manage the course catalog, modules and lessons.</p>
          </div>
          <button type="button" className="admin-primary-btn" onClick={openCreate}>
            <Plus size={16} strokeWidth={2} /> New course
          </button>
        </header>

        {error && <div className="admin-error-banner">{error}</div>}

        <div className="admin-toolbar">
          <label className="admin-search">
            <Search size={17} strokeWidth={1.8} />
            <input
              type="text"
              placeholder="Search courses by title"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="admin-filter-pills">
            {["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"].map((status) => (
              <button
                type="button"
                key={status}
                className={statusFilter === status ? "active" : ""}
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="admin-stat-grid">
            {Array.from({ length: 3 }, (_, index) => <CardSkeleton key={index} lines={3} />)}
          </div>
        ) : filtered.length ? (
          <div className="admin-course-card-list">
            {filtered.map((course) => (
              <article className="admin-course-card" key={course.id}>
                <div className="admin-course-card-row" onClick={() => setExpanded(expanded === course.id ? null : course.id)}>
                  <button type="button" className="admin-expand-toggle" aria-label="Toggle modules">
                    {expanded === course.id ? <ChevronDown size={16} strokeWidth={2} /> : <ChevronRight size={16} strokeWidth={2} />}
                  </button>
                  <div className="admin-course-card-title">
                    <strong>{course.title}</strong>
                    <span>{course.categoryName || "Uncategorized"} - {course.instructorName || "No instructor"}</span>
                  </div>
                  <span className={`admin-badge ${statusTone(course.status)}`}>{course.status || "DRAFT"}</span>
                  <span className="admin-course-card-meta">{course.totalEnrollments || 0} enrolled</span>
                  <div className="admin-course-card-actions" onClick={(event) => event.stopPropagation()}>
                    <button type="button" onClick={() => openEdit(course)} aria-label="Edit course">
                      <Pencil size={15} strokeWidth={1.8} />
                    </button>
                    <Link href={`/certificate-template?courseId=${course.id}`} aria-label="Certificate template">
                      <BadgeCheck size={15} strokeWidth={1.8} />
                    </Link>
                    {(course.status || "").toUpperCase() !== "PUBLISHED" && (
                      <button type="button" onClick={() => handlePublish(course)} aria-label="Publish course">
                        <Rocket size={15} strokeWidth={1.8} />
                      </button>
                    )}
                    {(course.status || "").toUpperCase() !== "ARCHIVED" && (
                      <button type="button" onClick={() => handleArchive(course)} aria-label="Archive course">
                        <Archive size={15} strokeWidth={1.8} />
                      </button>
                    )}
                    <button type="button" className="admin-icon-danger" onClick={() => handleDelete(course)} aria-label="Delete course">
                      <Trash2 size={15} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>

                {expanded === course.id && (
                  <div className="admin-course-card-content">
                    <div className="admin-panel-heading">
                      <div>
                        <Layers size={16} strokeWidth={1.8} />
                        <h2>Modules and lessons</h2>
                      </div>
                    </div>
                    <ModulesPanel courseId={course.id} />
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="admin-empty">No courses match this filter yet.</p>
        )}
      </section>

      {modalOpen && (
        <div className="admin-drawer-overlay" onClick={() => !saving && setModalOpen(false)}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <header>
              <h2>{editingCourse ? "Edit course" : "New course"}</h2>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="Close">
                <X size={18} strokeWidth={1.8} />
              </button>
            </header>

            <div className="admin-form-grid">
              <label>
                <span>Title</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                />
              </label>
              <label className="admin-form-span-2">
                <span>Description</span>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                />
              </label>
              <label>
                <span>Thumbnail URL</span>
                <input
                  type="text"
                  value={form.thumbnailUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, thumbnailUrl: event.target.value }))}
                />
              </label>
              <label>
                <span>Visibility</span>
                <select
                  value={form.visibility}
                  onChange={(event) => setForm((prev) => ({ ...prev, visibility: event.target.value as CourseFormState["visibility"] }))}
                >
                  <option value="PUBLIC">Public</option>
                  <option value="ORGANIZATION">Organization</option>
                </select>
              </label>
              {!editingCourse ? (
                <label>
                  <span>Category</span>
                  <select
                    value={form.categoryId}
                    onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                  >
                    <option value="">No category</option>
                    {flatCategories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="admin-form-span-2">
                  <span>Category</span>
                  <input type="text" value={editingCourse.categoryName || "Uncategorized"} disabled />
                  <small className="field-note">
                    Category and organization are set at creation and can&apos;t be changed here yet.
                  </small>
                </label>
              )}
              <label>
                <span>Duration (hours)</span>
                <input
                  type="number"
                  value={form.durationHours}
                  onChange={(event) => setForm((prev) => ({ ...prev, durationHours: event.target.value }))}
                />
              </label>
              <label>
                <span>Price</span>
                <input
                  type="number"
                  value={form.price}
                  onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                />
              </label>
            </div>

            <footer>
              <button type="button" className="admin-ghost-btn" onClick={() => setModalOpen(false)} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="admin-primary-btn" onClick={submitForm} disabled={saving || !form.title.trim()}>
                {saving ? "Saving..." : editingCourse ? "Save changes" : "Create course"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}

export default function CoursesPage() {
  return (
    <AdminGuard>
      <CoursesContent />
    </AdminGuard>
  );
}
