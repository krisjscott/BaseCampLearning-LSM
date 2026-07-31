"use client";

import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  CalendarClock,
  ChevronRight,
  Compass,
  Route,
  Home,
  Search,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PublicDashboardResponse, UserResponse, getCurrentUser, getPublicDashboard } from "../lib/backendApi";

const navItems = [
  ["Learning Home", Home, true],
  ["My Learning", BookOpen, false],
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

const actionRows = [
  ["Mandatory learning", "Required company and role training.", "3 items - Next due Jul 30", ShieldCheck],
  ["Upcoming checkpoints", "Scheduled assessments and module dates.", "2 upcoming - Jul 28", CalendarClock],
  ["Recommended paths", "Personalized courses based on your goals.", "4 curated paths", Route],
] as const;

function firstName(user?: UserResponse | null) {
  return user?.fullName?.split(" ")[0] || user?.email?.split("@")[0] || "Nirjhar";
}

export default function LearningHome() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [dashboard, setDashboard] = useState<PublicDashboardResponse | null>(null);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getCurrentUser(), getPublicDashboard()])
      .then(([userResult, dashboardResult]) => {
        if (!active) return;
        if (userResult.status === "fulfilled" && userResult.value) setUser(userResult.value);
        if (dashboardResult.status === "fulfilled" && dashboardResult.value) setDashboard(dashboardResult.value);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const learnerName = firstName(user);
  const featured = dashboard?.continueLearning?.[0];
  const recommendations = dashboard?.recommendedCourses || [];
  const progress = Math.round(featured?.completionPercentage ?? 58);

  const dashboardActions = useMemo(() => {
    if (!recommendations.length) return actionRows;
    return actionRows.map((row, index) => {
      if (index !== 2) return row;
      return [
        "Recommended paths",
        "Personalized courses based on your goals.",
        `${recommendations.length} curated paths`,
        Route,
      ] as const;
    });
  }, [recommendations]);

  return (
    <main className="learning-home">
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
          {trails.map(([name, progressValue]) => (
            <div key={name}>
              <span>{name}</span>
              <strong>{progressValue}</strong>
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

      <section className="learning-main">
        <header className="learning-header">
          <div>
            <h1>Good morning, {learnerName}.</h1>
            <p>Ready for the next checkpoint?</p>
          </div>
          <label className="learning-search">
            <Search size={20} />
            <input aria-label="Search courses or ask BaseCamp" placeholder="Search courses or ask BaseCamp" />
          </label>
          <button type="button" className="header-profile" aria-label={`${learnerName} profile`}>
            {learnerName.charAt(0).toUpperCase()}
          </button>
        </header>

        <div className="learning-grid">
          <section className="learning-left-column">
            <h2>Your learning</h2>

            <article className="featured-course">
              <p>In progress - Mandatory</p>
              <h3>{featured?.courseTitle || "Google Project Management"}</h3>
              <span>Module 3 - Planning &amp; Execution</span>
              <div className="featured-progress" aria-label={`${progress} percent course progress`}>
                <span style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }} />
              </div>
              <div className="progress-copy">
                <strong>{progress}%</strong>
                <span>course progress</span>
              </div>
              <dl className="course-meta">
                <div>
                  <dt>Last activity</dt>
                  <dd>{featured?.lastAccessedAt ? new Date(featured.lastAccessedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "Jul 24, 2026"}</dd>
                </div>
                <div>
                  <dt>Next checkpoint</dt>
                  <dd>Define scope &amp; deliverables - Jul 28</dd>
                </div>
              </dl>
              <button type="button">
                <span>Continue</span>
                <ArrowRight size={20} />
              </button>
            </article>

            <section className="timeline-card">
              <strong>Course timeline</strong>
              <p>Started Jul 08 - Module 2 completed Jul 19 - Next checkpoint Jul 28</p>
            </section>

            <div className="learning-action-list">
              {dashboardActions.map(([title, description, meta, Icon]) => (
                <button type="button" key={title}>
                  <span className="action-icon">
                    <Icon size={20} strokeWidth={1.8} />
                  </span>
                  <span>
                    <strong>{title}</strong>
                    <small>{description}</small>
                  </span>
                  <em>{meta}</em>
                  <ChevronRight size={18} />
                </button>
              ))}
            </div>
          </section>

          <aside className="learning-right-column">
            <h2>Today at BaseCamp</h2>

            <section className="stat-card level-card">
              <p>Current level</p>
              <h3>Builder</h3>
              <span>2,480 / 4,000 XP</span>
              <div>
                <span />
              </div>
              <small>Next: Achiever - 1,520 XP to go</small>
            </section>

            <section className="stat-card week-card">
              <h3>This week</h3>
              <div>
                <strong>3 / 5</strong>
                <span>learning goals</span>
              </div>
              <small>2h 18m learned - 2-day streak</small>
            </section>

            <section className="stat-card certificate-card">
              <h3>Certificates</h3>
              <strong>1 ready to download</strong>
              <p>2 certifications in progress</p>
              <button type="button">
                <Award size={16} />
                <span>View certificates -&gt;</span>
              </button>
            </section>

            <section className="stat-card checkpoint-card">
              <p>Upcoming</p>
              <h3>Scope &amp; Deliverables Quiz</h3>
              <span>Jul 28 - 12 questions - Required</span>
              <hr />
              <small>Unlocks after the video is watched</small>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
