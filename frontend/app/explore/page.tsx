"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "../components/AuthGuard";
import LearningSidebar from "../components/LearningSidebar";
import {
  CourseResponse,
  PublicDashboardResponse,
  UserResponse,
  getCourses,
  getCurrentUser,
  getPublicDashboard,
} from "../lib/backendApi";
import { encodeId } from "../lib/idCodec";
import { CardSkeleton } from "../components/Skeleton";

function ExploreContent() {
  const router = useRouter();
  const [backendCourses, setBackendCourses] = useState<CourseResponse[]>([]);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [dashboard, setDashboard] = useState<PublicDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(() => {
    setLoading(true);
    return Promise.allSettled([getCourses(12), getCurrentUser(), getPublicDashboard()])
      .then(([coursesResult, userResult, dashboardResult]) => {
        if (coursesResult.status === "fulfilled") {
          setBackendCourses(coursesResult.value?.content || []);
        } else {
          setBackendCourses([]);
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
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let active = true;
    fetchCourses().then(() => {
      if (!active) return;
    });
    return () => {
      active = false;
    };
  }, [fetchCourses]);

  const courseRows = useMemo(() => {
    return backendCourses.slice(0, 3).map((course) => ({
      id: course.id,
      title: course.title,
      level: course.categoryName || course.status || "Course",
      duration: course.durationHours ? `${course.durationHours} hours` : "Self-paced",
    }));
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

  return (
    <main className="explore-page">
      <LearningSidebar activeHref="/explore" dashboard={dashboard} loading={loading} user={user} />

      <section className="explore-main">
        <header className="explore-header">
          <div>
            <h1>Explore</h1>
            <p>Discover courses, certificates and role-based learning paths.</p>
          </div>
        </header>

        <section className="explore-hero">
          <h2>Build practical skills. Earn recognised credentials.</h2>
          <p>Curated learning across project management, content, design and communication.</p>
          <button
            type="button"
            onClick={() => {
              document.getElementById("popular-courses")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Browse collection -&gt;
          </button>
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

        <h2 className="popular-courses-title" id="popular-courses">Popular courses</h2>

        <div className="explore-content-grid">
          <section className="popular-course-list" aria-label="Popular courses">
            {loading ? Array.from({ length: 3 }, (_, index) => (
              <CardSkeleton key={index} lines={2} />
            )) : courseRows.length ? courseRows.map((course) => (
              <article key={course.id}>
                <div>
                  <h3>{course.title}</h3>
                  <p>
                    {course.level} - {course.duration}
                  </p>
                </div>
                <button type="button" onClick={() => router.push(`/course?courseId=${encodeId(course.id)}`)}>View course -&gt;</button>
              </article>
            )) : (
              <article>
                <div>
                  <h3>No published courses yet</h3>
                  <p>The production courses table did not return records for this account.</p>
                </div>
                <button type="button" onClick={() => fetchCourses()}>Refresh -&gt;</button>
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
                <button type="button" onClick={() => router.push("/path/project-management")}>Open path -&gt;</button>
              </>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

export default function ExploreCourses() {
  return (
    <AuthGuard>
      <ExploreContent />
    </AuthGuard>
  );
}
