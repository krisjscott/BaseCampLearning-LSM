"use client";

import { PlayCircle } from "lucide-react";
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

function ProjectManagementPathContent() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [dashboard, setDashboard] = useState<PublicDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([searchCourses("project management", 6), getCurrentUser(), getPublicDashboard()])
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
      [`${totalHours}h`, "Estimated"],
      [String(instructors.size), "Instructors"],
    ] as const;
  }, [courses]);

  const completedCount = useMemo(() => {
    const progressByCourse = new Map((dashboard?.continueLearning || []).map((item) => [item.courseId, item.completionPercentage || 0]));
    return courses.filter((course) => (progressByCourse.get(course.id) || 0) >= 100).length;
  }, [courses, dashboard]);

  const firstCourse = courses[0];

  return (
    <main className="path-page">
      <LearningSidebar activeHref="/explore" dashboard={dashboard} loading={loading} user={user} />

      <section className="path-main">
        <header className="path-header">
          <div>
            <h1>Project Management Path</h1>
            <p>A structured route from Starter to Champion.</p>
          </div>
          {firstCourse ? (
            <button type="button" onClick={() => router.push(`/course?courseId=${encodeId(firstCourse.id)}`)}>
              <PlayCircle size={18} />
              <span>Start path</span>
            </button>
          ) : null}
        </header>

        <section className="path-hero">
          <h2>{courses.length ? `${completedCount} of ${courses.length} courses complete` : "Project Management Path"}</h2>
          <p>Complete every course in this path, along with their required quizzes and checkpoints.</p>
          <button
            type="button"
            onClick={() => {
              document.getElementById("path-curriculum")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            View full path -&gt;
          </button>
        </section>

        <section className="path-stats" aria-label="Path summary">
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

        <h2 className="path-curriculum-title" id="path-curriculum">Path curriculum</h2>

        <div className="path-content-grid">
          <section className="path-curriculum-list" aria-label="Path curriculum">
            {loading ? Array.from({ length: 3 }, (_, index) => <CardSkeleton key={index} lines={2} />) : courses.length ? courses.map((course, index) => (
              <article key={course.id}>
                <div>
                  <h3>{index + 1}. {course.title}</h3>
                  <p>{course.instructorName || course.categoryName || "Available"}</p>
                </div>
                <button type="button" onClick={() => router.push(`/course?courseId=${encodeId(course.id)}`)}>Begin -&gt;</button>
              </article>
            )) : (
              <article>
                <div>
                  <h3>No courses found</h3>
                  <p>No project management courses are published yet.</p>
                </div>
              </article>
            )}
          </section>

          <aside className="path-progress-card">
            <h2>Path progress</h2>
            <p>{loading ? "Loading progress..." : `${completedCount} of ${courses.length} courses completed.`}</p>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default function ProjectManagementPath() {
  return (
    <AuthGuard>
      <ProjectManagementPathContent />
    </AuthGuard>
  );
}
