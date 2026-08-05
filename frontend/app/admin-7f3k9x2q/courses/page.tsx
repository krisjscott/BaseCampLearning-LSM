"use client";

import {
  Archive,
  ChevronDown,
  ChevronRight,
  Layers,
  Pencil,
  Plus,
  Rocket,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminGuard from "../../components/AdminGuard";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { CardSkeleton } from "../../components/Skeleton";
import { CourseResponse, getAuthSession, getCurrentUser, UserResponse } from "../../lib/backendApi";
import {
  CategoryResponse,
  CreateLessonRequest,
  CreateModuleRequest,
  ModuleResponse,
  OrganizationResponse,
  archiveCourse,
  createCourse,
  createLesson,
  createModule,
  deleteCourse,
  deleteLesson,
  deleteModule,
  getAdminCourses,
  getCategories,
  getCourseModules,
  getOrganizations,
  publishCourse,
  updateCourse,
} from "../../lib/adminApi";

type CourseFormState = {
  title: string;
  description: string;
  thumbnailUrl: string;
  categoryId: string;
  organizationId: string;
  visibility: "PUBLIC" | "ORGANIZATION";
  durationHours: string;
  price: string;
};

const emptyForm: CourseFormState = {
  title: "",
  description: "",
  thumbnailUrl: "",
  categoryId: "",
  organizationId: "",
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

function ModulesPanel({ courseId }: { courseId: string }) {
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingModule, setAddingModule] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: "", contentType: "VIDEO", durationMinutes: "" });
  const [panelError, setPanelError] = useState<string | null>(null);

  function reload() {
    setLoading(true);
    getCourseModules(courseId)
      .then((rows) => setModules(rows))
      .catch(() => setModules([]))
      .finally(() => setLoading(false));
  }

  useEffect(reload, [courseId]);

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
      {modules.map((module) => (
        <div className="admin-module-row" key={module.id}>
          <div className="admin-module-heading">
            <strong>{module.title}</strong>
            <div>
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

          {(module.lessons || []).map((lesson) => (
            <div className="admin-lesson-row" key={lesson.id}>
              <span>{lesson.title}</span>
              <small>{lesson.contentType || "CONTENT"}{lesson.durationMinutes ? ` - ${lesson.durationMinutes}m` : ""}</small>
              <button
                type="button"
                className="admin-icon-danger"
                aria-label={`Delete lesson ${lesson.title}`}
                onClick={() => removeLesson(lesson.id, lesson.title)}
              >
                <Trash2 size={13} strokeWidth={2} />
              </button>
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
  const [admin, setAdmin] = useState<UserResponse | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(null);
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
    getOrganizations().then(setOrganizations).catch(() => undefined);
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

  function openEdit(course: CourseResponse) {
    setEditingCourse(course);
    setForm({
      title: course.title || "",
      description: course.description || "",
      thumbnailUrl: course.thumbnailUrl || "",
      categoryId: "",
      organizationId: "",
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
        const instructorId = admin?.id;
        if (!instructorId) throw new Error("Could not resolve the current admin's user id.");
        await createCourse(instructorId, {
          title: form.title.trim(),
          description: form.description || undefined,
          thumbnailUrl: form.thumbnailUrl || undefined,
          categoryId: form.categoryId || undefined,
          organizationId: form.organizationId || undefined,
          visibility: form.visibility,
          durationHours: form.durationHours ? Number(form.durationHours) : undefined,
          price: form.price ? Number(form.price) : undefined,
        });
      }
      setModalOpen(false);
      reloadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the course.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(course: CourseResponse) {
    setError(null);
    try {
      await publishCourse(course.id);
      reloadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Could not publish "${course.title}".`);
    }
  }

  async function handleArchive(course: CourseResponse) {
    setError(null);
    try {
      await archiveCourse(course.id);
      reloadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Could not archive "${course.title}".`);
    }
  }

  async function handleDelete(course: CourseResponse) {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    setError(null);
    try {
      await deleteCourse(course.id);
      reloadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Could not delete "${course.title}".`);
    }
  }

  return (
    <main className="admin-shell">
      <AdminSidebar activeHref="/admin-7f3k9x2q/courses" role={role} admin={admin} />

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
                <>
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
                  <label>
                    <span>Organization</span>
                    <select
                      value={form.organizationId}
                      onChange={(event) => setForm((prev) => ({ ...prev, organizationId: event.target.value }))}
                    >
                      <option value="">None (public course)</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  </label>
                </>
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
