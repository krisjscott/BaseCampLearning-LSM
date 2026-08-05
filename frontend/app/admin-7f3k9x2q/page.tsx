"use client";

import { Activity, ArrowUpRight, ClipboardList, Cpu, Radio, ServerCog, TrendingUp, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AdminGuard from "../components/AdminGuard";
import AdminSidebar from "../components/admin/AdminSidebar";
import { CardSkeleton } from "../components/Skeleton";
import { getAuthSession, getCurrentUser, UserResponse } from "../lib/backendApi";
import {
  AdminDashboardResponse,
  AnalyticsDashboardResponse,
  OrganizationResponse,
  PopularCourseReport,
  SUPER_ADMIN_ROLE,
  getAdminDashboard,
  getAnalyticsDashboard,
  getOrganizations,
  getPopularCourses,
} from "../lib/adminApi";

const infraStatus = [
  { label: "API availability", value: "99.97%", tone: "good" },
  { label: "Avg response time", value: "182 ms", tone: "good" },
  { label: "Queue backlog", value: "0 jobs", tone: "good" },
  { label: "Error rate (24h)", value: "0.04%", tone: "watch" },
] as const;

function formatNumber(value?: number | null) {
  return Math.round(value || 0).toLocaleString();
}

function formatPercent(value?: number | null) {
  return `${Math.round(value || 0)}%`;
}

function AdminDashboardContent() {
  const router = useRouter();
  const [admin, setAdmin] = useState<UserResponse | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [organizationId, setOrganizationId] = useState<string>("");
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsDashboardResponse | null>(null);
  const [popularCourses, setPopularCourses] = useState<PopularCourseReport[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const session = getAuthSession();
  const role = session?.role || "";

  useEffect(() => {
    if (role && role !== SUPER_ADMIN_ROLE) {
      router.replace("/admin-7f3k9x2q/courses");
    }
  }, [role, router]);

  useEffect(() => {
    if (role !== SUPER_ADMIN_ROLE) return;
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
  }, [role]);

  useEffect(() => {
    if (!organizationId || role !== SUPER_ADMIN_ROLE) return;
    let active = true;
    setLoadingStats(true);
    setError(null);

    Promise.allSettled([
      getAdminDashboard(organizationId),
      getAnalyticsDashboard(organizationId),
      getPopularCourses(5),
    ])
      .then(([dashboardResult, analyticsResult, popularResult]) => {
        if (!active) return;
        setDashboard(dashboardResult.status === "fulfilled" ? dashboardResult.value : null);
        setAnalytics(analyticsResult.status === "fulfilled" ? analyticsResult.value : null);
        setPopularCourses(popularResult.status === "fulfilled" ? popularResult.value : []);
        if (dashboardResult.status === "rejected") setError("Could not load dashboard metrics for this organization.");
      })
      .finally(() => {
        if (active) setLoadingStats(false);
      });

    return () => {
      active = false;
    };
  }, [organizationId]);

  const dailyActiveUsers = useMemo(() => (analytics?.dailyActiveUsers || []).slice(-7), [analytics]);
  const maxActiveUsers = Math.max(1, ...dailyActiveUsers.map((item) => item.activeUsers || 0));
  const pendingAssignments = dashboard?.pendingAssignments || [];
  const loading = loadingOrgs || loadingStats;

  if (role && role !== SUPER_ADMIN_ROLE) {
    return null;
  }

  return (
    <main className="admin-shell">
      <AdminSidebar activeHref="/admin-7f3k9x2q" role={role} admin={admin} />

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">Ops Console</span>
            <h1>Dashboard</h1>
            <p>Summary, traffic and infrastructure signal across your organization.</p>
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

        <section className="admin-stat-grid" aria-label="Summary">
          {loading ? (
            Array.from({ length: 4 }, (_, index) => <CardSkeleton key={index} lines={2} />)
          ) : (
            <>
              <article>
                <Users size={20} strokeWidth={1.8} />
                <strong>{formatNumber(dashboard?.activeEmployees)}</strong>
                <span>Active learners</span>
              </article>
              <article>
                <ClipboardList size={20} strokeWidth={1.8} />
                <strong>{formatNumber(dashboard?.totalCourses)}</strong>
                <span>Total courses</span>
              </article>
              <article>
                <TrendingUp size={20} strokeWidth={1.8} />
                <strong>{formatPercent(dashboard?.averageCompletionRate)}</strong>
                <span>Avg completion rate</span>
              </article>
              <article>
                <Activity size={20} strokeWidth={1.8} />
                <strong>{formatNumber(pendingAssignments.length)}</strong>
                <span>Courses with pending work</span>
              </article>
            </>
          )}
        </section>

        <div className="admin-grid">
          <section className="admin-panel admin-panel-wide">
            <div className="admin-panel-heading">
              <div>
                <Radio size={18} strokeWidth={1.8} />
                <h2>Traffic - daily active learners</h2>
              </div>
              <span>Last {dailyActiveUsers.length || 7} days</span>
            </div>

            {loading ? (
              <CardSkeleton lines={4} />
            ) : dailyActiveUsers.length ? (
              <div className="admin-bar-chart" role="img" aria-label="Daily active learners over the last week">
                {dailyActiveUsers.map((day) => (
                  <div key={day.date} className="admin-bar-column">
                    <div
                      className="admin-bar"
                      style={{ height: `${Math.max(6, Math.round((day.activeUsers / maxActiveUsers) * 100))}%` }}
                      title={`${day.activeUsers} active learners`}
                    />
                    <small>
                      {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                    </small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="admin-empty">No traffic data reported yet for this organization.</p>
            )}
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <ServerCog size={18} strokeWidth={1.8} />
                <h2>Infra monitor</h2>
              </div>
            </div>
            <p className="admin-panel-caption">Read-only status view. Live infra telemetry is not yet wired to a backend service.</p>
            <div className="admin-infra-list">
              {infraStatus.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <strong className={item.tone === "watch" ? "is-watch" : "is-good"}>{item.value}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="admin-grid">
          <section className="admin-panel admin-panel-wide">
            <div className="admin-panel-heading">
              <div>
                <Cpu size={18} strokeWidth={1.8} />
                <h2>Pending course work</h2>
              </div>
            </div>
            {loading ? (
              <CardSkeleton lines={3} />
            ) : pendingAssignments.length ? (
              <div className="admin-course-list">
                {pendingAssignments.map((item) => (
                  <div key={item.courseId}>
                    <section>
                      <strong>{item.courseTitle}</strong>
                    </section>
                    <small>{item.pendingCount} pending</small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="admin-empty">Nothing pending review right now.</p>
            )}
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <ArrowUpRight size={18} strokeWidth={1.8} />
                <h2>Popular courses</h2>
              </div>
            </div>
            {loading ? (
              <CardSkeleton lines={3} />
            ) : popularCourses.length ? (
              <div className="admin-ranked-list">
                {popularCourses.map((course, index) => (
                  <div key={course.courseId}>
                    <strong>{index + 1}</strong>
                    <section>
                      <span>{course.courseTitle}</span>
                      <small>{formatNumber(course.totalEnrollments)} enrollments</small>
                    </section>
                  </div>
                ))}
              </div>
            ) : (
              <p className="admin-empty">No enrollment activity yet.</p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}
