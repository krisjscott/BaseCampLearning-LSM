"use client";

import { Activity, ArrowUpRight, ClipboardList, Cpu, Radio, ServerCog, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import AdminGuard from "./components/AdminGuard";
import AdminSidebar from "./components/AdminSidebar";
import { CardSkeleton } from "./components/Skeleton";
import { getAuthSession, getCurrentUser, UserResponse } from "./lib/backendApi";
import {
  AdminCourseResponse,
  AdminDashboardStatsResponse,
  DailyActiveUsersResponse,
  PopularCourseReport,
  getAdminCourses,
  getAdminDashboardStats,
  getDailyActiveUsers,
  getPopularCourses,
} from "./lib/adminApi";

function formatNumber(value?: number | null) {
  return Math.round(value || 0).toLocaleString();
}

function formatPercent(value?: number | null) {
  return `${Math.round(value || 0)}%`;
}

type ApiHealth = "checking" | "up" | "down";

function AdminDashboardContent() {
  const [admin, setAdmin] = useState<UserResponse | null>(null);
  const [platformStats, setPlatformStats] = useState<AdminDashboardStatsResponse | null>(null);
  const [draftCourses, setDraftCourses] = useState<AdminCourseResponse[]>([]);
  const [dailyActiveUsers, setDailyActiveUsers] = useState<DailyActiveUsersResponse[]>([]);
  const [popularCourses, setPopularCourses] = useState<PopularCourseReport[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiHealth, setApiHealth] = useState<ApiHealth>("checking");

  useEffect(() => {
    let active = true;
    fetch("/actuator/health")
      .then((response) => response.json())
      .then((body) => {
        if (active) setApiHealth(body?.status === "UP" ? "up" : "down");
      })
      .catch(() => {
        if (active) setApiHealth("down");
      });
    return () => {
      active = false;
    };
  }, []);

  const session = getAuthSession();
  const role = session?.role || "";

  useEffect(() => {
    let active = true;
    setLoadingStats(true);
    setError(null);

    getCurrentUser().then((value) => {
      if (active) setAdmin(value);
    }).catch(() => undefined);

    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - 6);
    const isoDate = (date: Date) => date.toISOString().slice(0, 10);

    Promise.allSettled([
      getAdminDashboardStats(),
      getAdminCourses(0, 5, "", "DRAFT"),
      getDailyActiveUsers(isoDate(from), isoDate(to)),
      getPopularCourses(5),
    ])
      .then(([statsResult, draftsResult, activeUsersResult, popularResult]) => {
        if (!active) return;
        setPlatformStats(statsResult.status === "fulfilled" ? statsResult.value : null);
        setDraftCourses(draftsResult.status === "fulfilled" ? draftsResult.value?.content || [] : []);
        setDailyActiveUsers(activeUsersResult.status === "fulfilled" ? activeUsersResult.value : []);
        setPopularCourses(popularResult.status === "fulfilled" ? popularResult.value : []);
        if (statsResult.status === "rejected") setError("Could not load dashboard metrics.");
      })
      .finally(() => {
        if (active) setLoadingStats(false);
      });

    return () => {
      active = false;
    };
  }, [role]);

  const maxActiveUsers = Math.max(1, ...dailyActiveUsers.map((item) => item.activeUsers || 0));
  const loading = loadingStats;

  return (
    <main className="admin-shell">
      <AdminSidebar activeHref="/" role={role} admin={admin} />

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">Ops Console</span>
            <h1>Dashboard</h1>
            <p>Summary, traffic and infrastructure signal across the platform.</p>
          </div>
        </header>

        {error && <div className="admin-error-banner">{error}</div>}

        <section className="admin-stat-grid" aria-label="Summary">
          {loading ? (
            Array.from({ length: 4 }, (_, index) => <CardSkeleton key={index} lines={2} />)
          ) : (
            <>
              <article>
                <Users size={20} strokeWidth={1.8} />
                <strong>{formatNumber(platformStats?.totalUsers)}</strong>
                <span>Total learners</span>
              </article>
              <article>
                <ClipboardList size={20} strokeWidth={1.8} />
                <strong>{formatNumber(platformStats?.totalCourses)}</strong>
                <span>Total courses</span>
              </article>
              <article>
                <TrendingUp size={20} strokeWidth={1.8} />
                <strong>{formatPercent(platformStats?.completionRate)}</strong>
                <span>Avg completion rate</span>
              </article>
              <article>
                <Activity size={20} strokeWidth={1.8} />
                <strong>{formatNumber(platformStats?.pendingReviews)}</strong>
                <span>Courses awaiting review</span>
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
              <p className="admin-empty">No traffic data reported yet.</p>
            )}
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <ServerCog size={18} strokeWidth={1.8} />
                <h2>Infra monitor</h2>
              </div>
            </div>
            <p className="admin-panel-caption">Live check against the backend's own health endpoint. No metrics/APM provider is connected, so response time, queue depth and error rate aren't shown here.</p>
            <div className="admin-infra-list">
              <div>
                <span>API health</span>
                <strong className={apiHealth === "up" ? "is-good" : apiHealth === "down" ? "is-watch" : ""}>
                  {apiHealth === "checking" ? "Checking..." : apiHealth === "up" ? "Operational" : "Unreachable"}
                </strong>
              </div>
            </div>
          </section>
        </div>

        <div className="admin-grid">
          <section className="admin-panel admin-panel-wide">
            <div className="admin-panel-heading">
              <div>
                <Cpu size={18} strokeWidth={1.8} />
                <h2>Courses awaiting review</h2>
              </div>
            </div>
            {loading ? (
              <CardSkeleton lines={3} />
            ) : draftCourses.length ? (
              <div className="admin-course-list">
                {draftCourses.map((course) => (
                  <div key={course.id}>
                    <section>
                      <strong>{course.title}</strong>
                    </section>
                    <small>Draft</small>
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
