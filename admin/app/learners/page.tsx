"use client";

import { Mail, Plus, Search, ShieldCheck, X, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminGuard from "../components/AdminGuard";
import AdminSidebar from "../components/AdminSidebar";
import { CardSkeleton } from "../components/Skeleton";
import { getAuthSession, getCurrentUser, UserResponse } from "../lib/backendApi";
import {
  AdminCourseResponse,
  AdminLearnerResponse,
  EnrollmentResponse,
  assignCourseToUser,
  getAdminCourses,
  getEnrollmentsForUser,
  getLearners,
  updateEnrollmentStatus,
} from "../lib/adminApi";

function statusTone(status?: string | null) {
  const normalized = (status || "").toLowerCase();
  if (normalized === "completed") return "is-live";
  if (normalized === "active") return "is-draft";
  if (normalized === "expired" || normalized === "dropped") return "is-muted";
  return "";
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function LearnersContent() {
  const [admin, setAdmin] = useState<UserResponse | null>(null);
  const [learners, setLearners] = useState<AdminLearnerResponse[]>([]);
  const [query, setQuery] = useState("");
  const [loadingLearners, setLoadingLearners] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<AdminLearnerResponse | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [enrollmentsError, setEnrollmentsError] = useState<string | null>(null);

  const [courses, setCourses] = useState<AdminCourseResponse[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignCourseId, setAssignCourseId] = useState("");
  const [assignDueDate, setAssignDueDate] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const session = getAuthSession();
  const role = session?.role || "";

  function reloadLearners() {
    setLoadingLearners(true);
    setError(null);
    getLearners(0, 200, query)
      .then((page) => setLearners(page?.content || []))
      .catch(() => setError("Could not load learners."))
      .finally(() => setLoadingLearners(false));
  }

  useEffect(() => {
    getCurrentUser().then(setAdmin).catch(() => undefined);
    getAdminCourses(0, 200).then((page) => setCourses(page?.content || [])).catch(() => undefined);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(reloadLearners, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const filtered = useMemo(() => learners, [learners]);

  function loadEnrollments(learner: AdminLearnerResponse) {
    setEnrollments([]);
    setEnrollmentsError(null);
    setLoadingEnrollments(true);
    getEnrollmentsForUser(learner.userId)
      .then((rows) => setEnrollments(rows))
      .catch(() => setEnrollmentsError("Could not load this learner's course progress."))
      .finally(() => setLoadingEnrollments(false));
  }

  function openLearner(learner: AdminLearnerResponse) {
    setSelected(learner);
    loadEnrollments(learner);
  }

  function openAssign() {
    setAssignCourseId("");
    setAssignDueDate("");
    setAssignError(null);
    setAssignOpen(true);
  }

  async function handleAssign() {
    if (!selected || !assignCourseId) return;
    if (!admin?.id) {
      setAssignError("Could not identify the signed-in admin. Please re-login and try again.");
      return;
    }
    setAssigning(true);
    setAssignError(null);
    try {
      await assignCourseToUser({
        userId: selected.userId,
        courseId: assignCourseId,
        assignedById: admin.id,
        dueDate: assignDueDate || undefined,
      });
      setAssignOpen(false);
      loadEnrollments(selected);
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : "Could not assign this course.");
    } finally {
      setAssigning(false);
    }
  }

  async function handleRevoke(enrollment: EnrollmentResponse) {
    if (!selected) return;
    if (!window.confirm(`Revoke access to "${enrollment.courseTitle || "this course"}"?`)) return;
    setEnrollmentsError(null);
    try {
      await updateEnrollmentStatus(enrollment.id, "DROPPED");
      loadEnrollments(selected);
    } catch (err) {
      setEnrollmentsError(err instanceof Error ? err.message : "Could not revoke access to this course.");
    }
  }

  return (
    <main className="admin-shell">
      <AdminSidebar activeHref="/learners" role={role} admin={admin} />

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">Ops Console</span>
            <h1>Learners</h1>
            <p>Directory and per-course progress for every registered learner.</p>
          </div>
        </header>

        {error && <div className="admin-error-banner">{error}</div>}

        <div className="admin-toolbar">
          <label className="admin-search">
            <Search size={17} strokeWidth={1.8} />
            <input
              type="text"
              placeholder="Search learners by name"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <span className="admin-toolbar-count">{filtered.length} learner{filtered.length === 1 ? "" : "s"}</span>
        </div>

        <section className="admin-panel admin-panel-wide">
          {loadingLearners ? (
            <CardSkeleton lines={5} />
          ) : filtered.length ? (
            <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Learner</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((learner) => (
                  <tr
                    key={learner.userId}
                    onClick={() => openLearner(learner)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Open profile for ${learner.fullName || "learner"}`}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openLearner(learner);
                      }
                    }}
                  >
                    <td>
                      <div className="admin-table-person">
                        <span>{(learner.fullName || "?").charAt(0).toUpperCase()}</span>
                        <div>
                          <strong>{learner.fullName || "Unnamed learner"}</strong>
                          <small>{learner.learnerCode || "No code"}</small>
                        </div>
                      </div>
                    </td>
                    <td>{learner.email || "-"}</td>
                    <td>{(learner.role || "PUBLIC_USER").replace(/_/g, " ")}</td>
                    <td>
                      <span className={`admin-badge ${learner.active ? "is-live" : "is-muted"}`}>
                        {learner.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          ) : (
            <p className="admin-empty">No learners found yet.</p>
          )}
        </section>
      </section>

      {selected && (
        <div className="admin-drawer-overlay" onClick={() => setSelected(null)}>
          <aside className="admin-drawer" onClick={(event) => event.stopPropagation()}>
            <header>
              <h2>Learner profile</h2>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close">
                <X size={18} strokeWidth={1.8} />
              </button>
            </header>

            <section className="admin-drawer-profile">
              <div>{(selected.fullName || "?").charAt(0).toUpperCase()}</div>
              <div>
                <strong>{selected.fullName || "Unnamed learner"}</strong>
                <span>{selected.learnerCode || "No learner code"}</span>
              </div>
            </section>

            <section className="admin-drawer-fields">
              <div>
                <Mail size={15} strokeWidth={1.8} />
                <span>Email</span>
                <strong>{selected.email || "-"}</strong>
              </div>
              <div>
                <ShieldCheck size={15} strokeWidth={1.8} />
                <span>Role</span>
                <strong>{(selected.role || "PUBLIC_USER").replace(/_/g, " ")}</strong>
              </div>
            </section>

            <div className="admin-drawer-subheading admin-drawer-subheading-row">
              <h3>Progress of courses</h3>
              <button type="button" className="admin-ghost-btn" onClick={openAssign}>
                <Plus size={14} strokeWidth={2} /> Assign course
              </button>
            </div>

            {loadingEnrollments ? (
              <CardSkeleton lines={3} />
            ) : enrollmentsError ? (
              <div className="admin-error-banner">{enrollmentsError}</div>
            ) : enrollments.length ? (
              <div className="admin-progress-list">
                {enrollments.map((enrollment) => (
                  <div key={enrollment.id}>
                    <section>
                      <strong>{enrollment.courseTitle || "Untitled course"}</strong>
                      <em>Enrolled {formatDate(enrollment.enrolledDate)}</em>
                    </section>
                    <div className="admin-progress-list-actions">
                      <span className={`admin-badge ${statusTone(enrollment.status)}`}>{enrollment.status || "UNKNOWN"}</span>
                      {(enrollment.status || "").toUpperCase() !== "DROPPED" && (
                        <button
                          type="button"
                          className="admin-icon-danger"
                          aria-label={`Revoke access to ${enrollment.courseTitle || "course"}`}
                          onClick={() => handleRevoke(enrollment)}
                        >
                          <XCircle size={15} strokeWidth={1.8} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="admin-empty">No course enrollments for this learner yet.</p>
            )}
          </aside>
        </div>
      )}

      {assignOpen && selected && (
        <div className="admin-drawer-overlay" onClick={() => !assigning && setAssignOpen(false)}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <header>
              <h2>Assign course to {selected.fullName || "learner"}</h2>
              <button type="button" onClick={() => setAssignOpen(false)} aria-label="Close">
                <X size={18} strokeWidth={1.8} />
              </button>
            </header>

            <div className="admin-form-grid">
              {assignError && <div className="admin-error-banner admin-form-span-2">{assignError}</div>}

              <label className="admin-form-span-2">
                <span>Course</span>
                <select value={assignCourseId} onChange={(event) => setAssignCourseId(event.target.value)}>
                  <option value="">Choose a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </label>

              <label className="admin-form-span-2">
                <span>Due date (optional)</span>
                <input type="date" value={assignDueDate} onChange={(event) => setAssignDueDate(event.target.value)} />
              </label>
            </div>

            <footer>
              <button type="button" className="admin-ghost-btn" onClick={() => setAssignOpen(false)} disabled={assigning}>
                Cancel
              </button>
              <button type="button" className="admin-primary-btn" onClick={handleAssign} disabled={assigning || !assignCourseId}>
                {assigning ? "Assigning..." : "Assign course"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}

export default function LearnersPage() {
  return (
    <AdminGuard>
      <LearnersContent />
    </AdminGuard>
  );
}
