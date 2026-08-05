"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "../../components/AuthGuard";
import LearningSidebar from "../../components/LearningSidebar";
import { CardSkeleton } from "../../components/Skeleton";
import {
  CourseResponse,
  PublicDashboardResponse,
  UserResponse,
  getCurrentUser,
  getPublicDashboard,
  searchCourses,
} from "../../lib/backendApi";
import { encodeId } from "../../lib/idCodec";

function BusinessManagementCategoryContent() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [dashboard, setDashboard] = useState<PublicDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([searchCourses("business management", 6), getCurrentUser(), getPublicDashboard()])
      .then(([coursesResult, userResult, dashboardResult]) => {
        if (!active) return;
        setCourses(coursesResult.status === "fulfilled" ? coursesResult.value?.content || [] : []);
        if (userResult.status === "fulfilled") setUser(userResult.value);
        setDashboard(dashboardResult.status === "fulfilled" ? dashboardResult.value : null);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    if (!courses.length) return [] as Array<readonly [string, string]>;
    const totalHours = courses.reduce((sum, course) => sum + (course.durationHours || 0), 0);
    const instructors = new Set(courses.map((course) => course.instructorName).filter(Boolean));
    return [
      [String(courses.length), "Courses"],
      [String(totalHours), "Total hours"],
      [String(instructors.size), "Instructors"],
    ] as const;
  }, [courses]);

  return (
    <main className="category-page">
      <LearningSidebar activeHref="/explore" dashboard={dashboard} loading={loading} user={user} />

      <section className="category-main">
        <header className="category-header">
          <div>
            <h1>Business &amp; Management</h1>
            <p>Courses for planning, operations, leadership and delivery.</p>
          </div>
        </header>

        <section className="category-hero">
          <h2>Project management learning collection</h2>
          <p>Progress from foundational planning to advanced delivery leadership.</p>
          <button
            type="button"
            onClick={() => {
              document.getElementById("featured-category")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Explore collection -&gt;
          </button>
        </section>

        <section className="category-stats" aria-label="Category summary">
          {loading ? Array.from({ length: 3 }, (_, index) => <CardSkeleton key={index} lines={2} />) : stats.length ? stats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          )) : (
            <article>
              <strong>0</strong>
              <p>Courses</p>
            </article>
          )}
        </section>

        <h2 className="featured-category-title" id="featured-category">Featured in this category</h2>

        <div className="category-content-grid">
          <section className="featured-category-list" aria-label="Featured courses">
            {loading ? Array.from({ length: 3 }, (_, index) => <CardSkeleton key={index} lines={2} />) : courses.length ? courses.map((course) => (
              <article key={course.id}>
                <div>
                  <h3>{course.title}</h3>
                  <p>{course.instructorName || course.categoryName || "Course"}</p>
                </div>
                <button type="button" onClick={() => router.push(`/course?courseId=${encodeId(course.id)}`)}>View -&gt;</button>
              </article>
            )) : (
              <article>
                <div>
                  <h3>No courses found</h3>
                  <p>No business & management courses are published yet.</p>
                </div>
              </article>
            )}
          </section>

          <aside className="category-skills-card">
            <h2>Category skills</h2>
            <p>Planning - Operations - Leadership - Communication</p>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default function BusinessManagementCategory() {
  return (
    <AuthGuard>
      <BusinessManagementCategoryContent />
    </AuthGuard>
  );
}
