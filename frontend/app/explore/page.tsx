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
import { CourseResponse, UserResponse, getCourses, getCurrentUser } from "../lib/backendApi";

const navItems = [
  ["Learning Home", Home, false],
  ["My Learning", BookOpen, false],
  ["Explore", Compass, true],
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
  ["42", "Courses"],
  ["8", "Certificates"],
  ["6", "Categories"],
] as const;

const popularCourses = [
  ["Project Management Foundations", "Beginner", "24 hours"],
  ["Content Strategy Essentials", "Beginner", "12 hours"],
  ["Data Analytics Basics", "Intermediate", "18 hours"],
] as const;

export default function ExploreCourses() {
  const [backendCourses, setBackendCourses] = useState<CourseResponse[]>([]);
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getCourses(12), getCurrentUser()])
      .then(([coursesResult, userResult]) => {
        if (!active) return;
        if (coursesResult.status === "fulfilled" && coursesResult.value?.content?.length) {
          setBackendCourses(coursesResult.value.content);
        }
        if (userResult.status === "fulfilled" && userResult.value) {
          setUser(userResult.value);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const courseRows = useMemo(() => {
    if (!backendCourses.length) return popularCourses;
    return backendCourses.slice(0, 3).map((course) => [
      course.title,
      course.categoryName || course.status || "Course",
      course.durationHours ? `${course.durationHours} hours` : "Self-paced",
    ] as const);
  }, [backendCourses]);

  const summaryStats = useMemo(() => {
    if (!backendCourses.length) return stats;
    const categories = new Set(backendCourses.map((course) => course.categoryName).filter(Boolean));
    const published = backendCourses.filter((course) => course.status === "PUBLISHED").length;
    return [
      [String(backendCourses.length), "Courses"],
      [String(published), "Published"],
      [String(categories.size || 1), "Categories"],
    ] as const;
  }, [backendCourses]);
  const learnerName = user?.fullName?.split(" ")[0] || user?.email?.split("@")[0] || "Nirjhar";

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
          {summaryStats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="popular-courses-title">Popular courses</h2>

        <div className="explore-content-grid">
          <section className="popular-course-list" aria-label="Popular courses">
            {courseRows.map(([title, level, duration]) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>
                    {level} - {duration}
                  </p>
                </div>
                <button type="button">View course -&gt;</button>
              </article>
            ))}
          </section>

          <aside className="recommended-path-card">
            <h2>Recommended path</h2>
            <p>Project Management - 4-course pathway.</p>
            <button type="button">Open path -&gt;</button>
          </aside>
        </div>
      </section>
    </main>
  );
}
