"use client";

import { Briefcase, Search, User, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminGuard from "../../components/AdminGuard";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { CardSkeleton } from "../../components/Skeleton";
import { getAuthSession, getCurrentUser, UserResponse } from "../../lib/backendApi";
import {
  EmployeeResponse,
  EnrollmentResponse,
  OrganizationResponse,
  getEmployees,
  getEnrollmentsForUser,
  getOrganizations,
} from "../../lib/adminApi";

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
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [organizationId, setOrganizationId] = useState<string>("");
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [query, setQuery] = useState("");
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<EmployeeResponse | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [enrollmentsError, setEnrollmentsError] = useState<string | null>(null);

  const session = getAuthSession();
  const role = session?.role || "";

  useEffect(() => {
    let active = true;
    getCurrentUser().then((value) => {
      if (active) setAdmin(value);
    }).catch(() => undefined);

    getOrganizations()
      .then((orgs) => {
        if (!active) return;
        setOrganizations(orgs);
        if (orgs.length) setOrganizationId(orgs[0].id);
      })
      .catch(() => setError("Could not load organizations."))
      .finally(() => {
        if (active) setLoadingOrgs(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!organizationId) return;
    let active = true;
    setLoadingEmployees(true);
    setError(null);

    getEmployees(organizationId)
      .then((rows) => {
        if (active) setEmployees(rows);
      })
      .catch(() => setError("Could not load learners for this organization."))
      .finally(() => {
        if (active) setLoadingEmployees(false);
      });

    return () => {
      active = false;
    };
  }, [organizationId]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return employees;
    return employees.filter((employee) =>
      [employee.fullName, employee.employeeCode, employee.jobTitle, employee.departmentName, employee.teamName]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(term)),
    );
  }, [employees, query]);

  function openLearner(employee: EmployeeResponse) {
    setSelected(employee);
    setEnrollments([]);
    setEnrollmentsError(null);
    setLoadingEnrollments(true);
    getEnrollmentsForUser(employee.userId)
      .then((rows) => setEnrollments(rows))
      .catch(() => setEnrollmentsError("Could not load this learner's course progress."))
      .finally(() => setLoadingEnrollments(false));
  }

  const loading = loadingOrgs || loadingEmployees;

  return (
    <main className="admin-shell">
      <AdminSidebar activeHref="/admin-7f3k9x2q/learners" role={role} admin={admin} />

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">Ops Console</span>
            <h1>Learners</h1>
            <p>Directory, profiles and per-course progress for your organization.</p>
          </div>

          <label className="admin-org-select">
            <span>Organization</span>
            <select
              value={organizationId}
              onChange={(event) => setOrganizationId(event.target.value)}
              disabled={loadingOrgs || !organizations.length}
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </label>
        </header>

        {error && <div className="admin-error-banner">{error}</div>}

        <div className="admin-toolbar">
          <label className="admin-search">
            <Search size={17} strokeWidth={1.8} />
            <input
              type="text"
              placeholder="Search learners by name, role or team"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <span className="admin-toolbar-count">{filtered.length} learner{filtered.length === 1 ? "" : "s"}</span>
        </div>

        <section className="admin-panel admin-panel-wide">
          {loading ? (
            <CardSkeleton lines={5} />
          ) : filtered.length ? (
            <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Learner</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Team</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((employee) => (
                  <tr
                    key={employee.id}
                    onClick={() => openLearner(employee)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Open profile for ${employee.fullName || "learner"}`}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openLearner(employee);
                      }
                    }}
                  >
                    <td>
                      <div className="admin-table-person">
                        <span>{(employee.fullName || "?").charAt(0).toUpperCase()}</span>
                        <div>
                          <strong>{employee.fullName || "Unnamed learner"}</strong>
                          <small>{employee.employeeCode || "No code"}</small>
                        </div>
                      </div>
                    </td>
                    <td>{employee.jobTitle || "-"}</td>
                    <td>{employee.departmentName || "-"}</td>
                    <td>{employee.teamName || "-"}</td>
                    <td>
                      <span className={`admin-badge ${employee.active ? "is-live" : "is-muted"}`}>
                        {employee.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          ) : (
            <p className="admin-empty">No learners found for this organization yet.</p>
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
                <span>{selected.employeeCode || "No employee code"}</span>
              </div>
            </section>

            <section className="admin-drawer-fields">
              <div>
                <Briefcase size={15} strokeWidth={1.8} />
                <span>Job title</span>
                <strong>{selected.jobTitle || "-"}</strong>
              </div>
              <div>
                <User size={15} strokeWidth={1.8} />
                <span>Department / team</span>
                <strong>{[selected.departmentName, selected.teamName].filter(Boolean).join(" / ") || "-"}</strong>
              </div>
            </section>

            <h3 className="admin-drawer-subheading">Progress of courses</h3>

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
                    <span className={`admin-badge ${statusTone(enrollment.status)}`}>{enrollment.status || "UNKNOWN"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="admin-empty">No course enrollments for this learner yet.</p>
            )}
          </aside>
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
