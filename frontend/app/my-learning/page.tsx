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
import { PublicDashboardResponse, UserResponse, getCurrentUser, getPublicDashboard } from "../lib/backendApi";
import AuthGuard from "../components/AuthGuard";

const navItems = [
  ["Learning Home", Home, false],
  ["My Learning", BookOpen, true],
  ["Explore", Compass, false],
  ["Achievements", Trophy, false],
  ["Certificates", Award, false],
  ["Progress", BarChart3, false],
] as const;

const trails = [
  ["Project Management", "58%"],
  ["Content Writing", "24%"],
  ["Graphic Design", "8%"],
] as const;

const stats = [
  ["3", "Active courses"],
  ["58%", "Primary path"],
  ["2h 18m", "This week"],
] as const;

const courses = [
  ["Content Writing Foundations", "24% complete - Last activity Jul 24", "Continue ->"],
  ["Graphic Design Essentials", "8% complete - 5 modules", "Resume ->"],
  ["Communication Mastery", "Starts Aug 02", "View details ->"],
] as const;

function MyLearning() {
  const [dashboard, setDashboard] = useState<PublicDashboardResponse | null>(null);
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getPublicDashboard(), getCurrentUser()])
      .then(([dashboardResult, userResult]) => {
        if (!active) return;
        if (dashboardResult.status === "fulfilled" && dashboardResult.value) setDashboard(dashboardResult.value);
        if (userResult.status === "fulfilled" && userResult.value) setUser(userResult.value);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const continueLearning = dashboard?.continueLearning || [];
  const courseRows = useMemo(() => {
    if (!continueLearning.length) return courses;
    return continueLearning.slice(0, 3).map((item) => [
      item.courseTitle,
      `${Math.round(item.completionPercentage || 0)}% complete${item.lastAccessedAt ? ` - Last activity ${new Date(item.lastAccessedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit" })}` : ""}`,
      "Continue ->",
    ] as const);
  }, [continueLearning]);

  const summaryStats = useMemo(() => {
    if (!continueLearning.length) return stats;
    const primary = Math.round(continueLearning[0]?.completionPercentage || 0);
    return [
      [String(continueLearning.length), "Active courses"],
      [`${primary}%`, "Primary path"],
      ["2h 18m", "This week"],
    ] as const;
  }, [continueLearning]);

  const featured = continueLearning[0];
  const learnerName = user?.fullName?.split(" ")[0] || user?.email?.split("@")[0] || "Nirjhar";

  return (
    <main className="my-learning-page">
      <aside className="learning-sidebar">
        <img src="/BasecampLogoExact.png" alt="BaseCamp" className="learning-sidebar-logo" />

        <nav className="learning-nav" aria-label="Learning sections">
          {navItems.map(([label, Icon, active]) => (
            <button type="button" className={active ? "active" : ""} key={label}>
              <Icon size={22} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <section className="recent-trails" aria-label="Recent trails">
          <p>Recent trails</p>
          {trails.map(([name, progress]) => (
            <div key={name}>
              <span>{name}</span>
              <strong>{progress}</strong>
            </div>
          ))}
        </section>
        <section className="learner-profile" aria-label="Learner profile">
          <div>{learnerName.charAt(0).toUpperCase()}</div>
          <section>
            <strong>{learnerName}</strong>
            <span>Builder - 2,480 XP</span>
            <small>BC-CR-021</small>
          </section>
        </section>
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
          <h2>Continue {featured?.courseTitle || "Google Project Management"}</h2>
          <p>Module 3 - Define scope and deliverables - Progress saved today</p>
          <button type="button">Continue learning -&gt;</button>
        </section>

        <section className="my-learning-stats" aria-label="Learning summary">
          {summaryStats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="your-courses-title">Your courses</h2>

        <div className="my-learning-content-grid">
          <section className="my-course-list">
            {courseRows.map(([title, meta, action]) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>{meta}</p>
                </div>
                <button type="button">{action}</button>
              </article>
            ))}
          </section>

          <aside className="weekly-goal-card">
            <h2>Weekly goal</h2>
            <p>3 of 5 learning goals completed.</p>
            <button type="button">View progress -&gt;</button>
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
