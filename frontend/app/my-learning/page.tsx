"use client";

import {
  Award,
  BarChart3,
  BookOpen,
  Compass,
  Home,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PublicDashboardResponse, UserResponse, getCurrentUser, getPublicDashboard } from "../lib/backendApi";
import AuthGuard from "../components/AuthGuard";
import { CardSkeleton, SidebarSkeleton, Skeleton } from "../components/Skeleton";

const navItems = [
  ["Learning Home", Home, false],
  ["My Learning", BookOpen, true],
  ["Explore", Compass, false],
  ["Achievements", Trophy, false],
  ["Certificates", Award, false],
  ["Progress", BarChart3, false],
] as const;

function MyLearning() {
  const [dashboard, setDashboard] = useState<PublicDashboardResponse | null>(null);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getPublicDashboard(), getCurrentUser()])
      .then(([dashboardResult, userResult]) => {
        if (!active) return;
        setDashboard(dashboardResult.status === "fulfilled" ? dashboardResult.value : null);
        if (userResult.status === "fulfilled" && userResult.value) setUser(userResult.value);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const continueLearning = dashboard?.continueLearning || [];
  const courseRows = useMemo(() => {
    return continueLearning.slice(0, 3).map((item) => [
      item.courseTitle,
      `${Math.round(item.completionPercentage || 0)}% complete${item.lastAccessedAt ? ` - Last activity ${new Date(item.lastAccessedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit" })}` : ""}`,
      "Continue ->",
    ] as const);
  }, [continueLearning]);

  const summaryStats = useMemo(() => {
    const primary = Math.round(continueLearning[0]?.completionPercentage || 0);
    return [
      [String(continueLearning.length), "Active courses"],
      [`${primary}%`, "Primary path"],
      [String(continueLearning.filter((item) => (item.completionPercentage || 0) >= 100).length), "Completed"],
    ] as const;
  }, [continueLearning]);

  const featured = continueLearning[0];
  const learnerName = user?.fullName?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  const trails = continueLearning.slice(0, 3).map((item) => [
    item.courseTitle,
    `${Math.round(item.completionPercentage || 0)}%`,
  ] as const);

  return (
    <main className="my-learning-page">
      <aside className="learning-sidebar">
        <img src="/basecamp-logo.png" alt="BaseCamp" className="learning-sidebar-logo" />

        <nav className="learning-nav" aria-label="Learning sections">
          {navItems.map(([label, Icon, active]) => (
            <a
              href={({
                "Learning Home": "/learning",
                "My Learning": "/my-learning",
                Explore: "/explore",
                Achievements: "/achievements",
                Certificates: "/certificates",
                Progress: "/progress",
              } as const)[label]}
              className={active ? "active" : ""}
              key={label}
            >
              <Icon size={22} strokeWidth={1.8} />
              <span>{label}</span>
            </a>
          ))}
        </nav>

        <section className="recent-trails" aria-label="Recent trails">
          <p>Recent trails</p>
          {loading ? <SidebarSkeleton /> : trails.length ? trails.map(([name, progress]) => (
            <div key={name}>
              <span>{name}</span>
              <strong>{progress}</strong>
            </div>
          )) : <small>No course progress yet</small>}
        </section>
        <Link href="/profile-preferences" className="learner-profile" aria-label="Open profile preferences">
          {loading ? (
            <>
              <div><Skeleton className="skeleton-pill" /></div>
              <SidebarSkeleton />
            </>
          ) : (
            <>
              <div>{learnerName.charAt(0).toUpperCase()}</div>
              <section>
                <strong>{learnerName}</strong>
                <span>{user?.role || "Learner"}</span>
                <small>{user?.learnerCode || "Profile code pending"}</small>
              </section>
            </>
          )}
        </Link>
      </aside>

      <section className="my-learning-main">
        <header className="my-learning-header">
          <div>
            <h1>My Learning</h1>
            <p>All enrolled courses, organised by priority and progress.</p>
          </div>
          <button type="button">
            <BookOpen size={18} />
            <span>Browse courses</span>
          </button>
        </header>

        <section className="continue-learning-card">
          {loading ? <CardSkeleton lines={3} /> : (
            <>
              <h2>{featured ? `Continue ${featured.courseTitle}` : "No active courses yet"}</h2>
              <p>{featured ? "Progress loaded from your account." : "Browse the catalogue and enroll to start learning."}</p>
              <button type="button">{featured ? "Continue learning ->" : "Browse courses ->"}</button>
            </>
          )}
        </section>

        <section className="my-learning-stats" aria-label="Learning summary">
          {loading ? Array.from({ length: 3 }, (_, index) => (
            <article key={index}>
              <CardSkeleton lines={2} />
            </article>
          )) : summaryStats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="your-courses-title">Your courses</h2>

        <div className="my-learning-content-grid">
          <section className="my-course-list">
            {loading ? Array.from({ length: 3 }, (_, index) => (
              <CardSkeleton key={index} lines={2} />
            )) : courseRows.length ? courseRows.map(([title, meta, action]) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>{meta}</p>
                </div>
                <button type="button">{action}</button>
              </article>
            )) : (
              <article>
                <div>
                  <h3>No courses enrolled</h3>
                  <p>Your courses will appear here after enrollment.</p>
                </div>
                <button type="button">Explore courses -&gt;</button>
              </article>
            )}
          </section>

          <aside className="weekly-goal-card">
            {loading ? <CardSkeleton lines={6} /> : (
              <>
                <div className="side-card-kicker">Weekly goal</div>
                <h2>{continueLearning.length} active</h2>
                <p>Weekly goals will update from your course progress.</p>
                <div className="side-card-meter" aria-label={`${continueLearning.length} active learning items`}>
                  <span style={{ width: `${Math.min(continueLearning.length * 20, 100)}%` }} />
                </div>
                <div className="weekly-goal-list" aria-label="Active learning items">
                  {continueLearning.length ? continueLearning.slice(0, 5).map((item) => (
                    <span key={item.courseId} className={(item.completionPercentage || 0) >= 100 ? "done" : ""}>
                      {item.courseTitle}
                    </span>
                  )) : <span>No active goals yet</span>}
                </div>
                <button type="button">View progress -&gt;</button>
              </>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

export default function MyLearningPage() {
  return (
    <AuthGuard>
      <MyLearning />
    </AuthGuard>
  );
}
