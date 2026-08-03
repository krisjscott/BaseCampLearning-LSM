"use client";

import {
  Award,
  BarChart3,
  BookOpen,
  Compass,
  Filter,
  Home,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CourseResponse,
  PublicDashboardResponse,
  UserResponse,
  getCourses,
  getCurrentUser,
  getPublicDashboard,
} from "../lib/backendApi";
import { CardSkeleton, SidebarSkeleton } from "../components/Skeleton";

const navItems = [
  ["Learning Home", Home, false],
  ["My Learning", BookOpen, false],
  ["Explore", Compass, true],
  ["Achievements", Trophy, false],
  ["Certificates", Award, false],
  ["Progress", BarChart3, false],
] as const;

export default function ExploreCourses() {
  const [backendCourses, setBackendCourses] = useState<CourseResponse[]>([]);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [dashboard, setDashboard] = useState<PublicDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getCourses(12), getCurrentUser(), getPublicDashboard()])
      .then(([coursesResult, userResult, dashboardResult]) => {
        if (!active) return;
        if (coursesResult.status === "fulfilled") {
          setBackendCourses(coursesResult.value?.content || []);
        }
        if (userResult.status === "fulfilled" && userResult.value) {
          setUser(userResult.value);
        }
        if (dashboardResult.status === "fulfilled" && dashboardResult.value) {
          setDashboard(dashboardResult.value);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const courseRows = useMemo(() => {
    return backendCourses.slice(0, 3).map((course) => [
      course.title,
      course.categoryName || course.status || "Course",
      course.durationHours ? `${course.durationHours} hours` : "Self-paced",
    ] as const);
  }, [backendCourses]);

  const summaryStats = useMemo(() => {
    const categories = new Set(backendCourses.map((course) => course.categoryName).filter(Boolean));
    const published = backendCourses.filter((course) => course.status === "PUBLISHED").length;
    return [
      [String(backendCourses.length), "Courses"],
      [String(published), "Published"],
      [String(categories.size || 1), "Categories"],
    ] as const;
  }, [backendCourses]);
  const learnerName = user?.fullName?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  const trails = (dashboard?.continueLearning || []).slice(0, 3).map((item) => [
    item.courseTitle,
    `${Math.round(item.completionPercentage || 0)}%`,
  ] as const);

  return (
    <main className="explore-page">
      <aside className="learning-sidebar">
        <img src="/basecamp-logo.png" alt="BaseCamp" className="learning-sidebar-logo" />

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
          {loading ? <SidebarSkeleton /> : trails.length ? trails.map(([name, progress]) => (
            <div key={name}>
              <span>{name}</span>
              <strong>{progress}</strong>
            </div>
          )) : <small>No course progress yet</small>}
        </section>
        <section className="learner-profile" aria-label="Learner profile">
          <div>{learnerName.charAt(0).toUpperCase()}</div>
          <section>
            <strong>{learnerName}</strong>
            <span>{user?.role || "Learner"}</span>
            <small>{user?.email || "Account active"}</small>
          </section>
        </section>
      </aside>

      <section className="explore-main">
        <header className="explore-header">
          <div>
            <h1>Explore</h1>
            <p>Discover courses, certificates and role-based learning paths.</p>
          </div>
          <button type="button">
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </header>

        <section className="explore-hero">
          <h2>Build practical skills. Earn recognised credentials.</h2>
          <p>Curated learning across project management, content, design and communication.</p>
          <button type="button">Browse collection -&gt;</button>
        </section>

        <section className="explore-stats" aria-label="Explore summary">
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

        <h2 className="popular-courses-title">Popular courses</h2>

        <div className="explore-content-grid">
          <section className="popular-course-list" aria-label="Popular courses">
            {loading ? Array.from({ length: 3 }, (_, index) => (
              <CardSkeleton key={index} lines={2} />
            )) : courseRows.length ? courseRows.map(([title, level, duration]) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>
                    {level} - {duration}
                  </p>
                </div>
                <button type="button">View course -&gt;</button>
              </article>
            )) : (
              <article>
                <div>
                  <h3>No published courses yet</h3>
                  <p>The production courses table did not return records for this account.</p>
                </div>
                <button type="button">Refresh -&gt;</button>
              </article>
            )}
          </section>

          <aside className="recommended-path-card">
            {loading ? <CardSkeleton lines={6} /> : (
              <>
                <div className="side-card-kicker">Recommended path</div>
                <h2>{dashboard?.recommendedCourses?.[0]?.courseTitle || "No path selected"}</h2>
                <p>{dashboard?.recommendedCourses?.length ? "Recommendations loaded from your learning profile." : "Complete onboarding and enrollments to generate recommendations."}</p>
                <div className="path-card-summary" aria-label="Recommended path summary">
                  <section>
                    <strong>{dashboard?.recommendedCourses?.length || 0}</strong>
                    <span>courses</span>
                  </section>
                  <section>
                    <strong>{backendCourses.reduce((total, course) => total + (course.durationHours || 0), 0)}</strong>
                    <span>hours listed</span>
                  </section>
                </div>
                <div className="path-card-stack" aria-label="Path sequence">
                  {(dashboard?.recommendedCourses || []).slice(0, 3).map((course) => (
                    <span key={course.courseId}>{course.courseTitle}</span>
                  ))}
                  {!dashboard?.recommendedCourses?.length ? <span>No recommendations yet</span> : null}
                </div>
                <button type="button">Open path -&gt;</button>
              </>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
