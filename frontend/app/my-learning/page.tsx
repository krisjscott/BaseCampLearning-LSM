"use client";

import { BookOpen, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "../components/AuthGuard";
import LearningSidebar from "../components/LearningSidebar";
import { CardSkeleton } from "../components/Skeleton";
import {
  EnrollmentResponse,
  PublicDashboardResponse,
  UserResponse,
  getCurrentUser,
  getMyEnrollments,
  getPublicDashboard,
} from "../lib/backendApi";
import { encodeId } from "../lib/idCodec";

function MyLearning() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<PublicDashboardResponse | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getPublicDashboard(), getCurrentUser()])
      .then(([dashboardResult, userResult]) => {
        if (!active) return;
        setDashboard(dashboardResult.status === "fulfilled" ? dashboardResult.value : null);
        if (userResult.status === "fulfilled" && userResult.value) {
          setUser(userResult.value);
          getMyEnrollments(userResult.value.id)
            .then((rows) => active && setEnrollments(rows))
            .catch(() => undefined);
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

  const continueLearning = dashboard?.continueLearning || [];

  // The dashboard's "continue learning" list deliberately excludes anything
  // already finished (see DashboardServiceImpl - that's correct for a
  // "pick up where you left off" widget) and is capped to 4 rows, so it's
  // the wrong source for "My Learning"'s full course list. Enrollments cover
  // every course the learner is (or was) in, completed or not; completion %
  // for the still-in-progress ones is borrowed from the dashboard snapshot
  // since per-course progress isn't on the enrollment record itself.
  const liveProgressByCourseId = useMemo(() => {
    const map = new Map<string, { completion: number; lastAccessedAt?: string | null }>();
    continueLearning.forEach((item) => {
      map.set(item.courseId, { completion: item.completionPercentage || 0, lastAccessedAt: item.lastAccessedAt });
    });
    return map;
  }, [continueLearning]);

  const courseRows = useMemo(() => {
    return enrollments
      .filter((item) => item.status !== "DROPPED" && item.status !== "EXPIRED")
      .map((item) => {
        const completed = item.status === "COMPLETED";
        const live = liveProgressByCourseId.get(item.courseId);
        const completion = completed ? 100 : Math.round(live?.completion || 0);
        return {
          courseId: item.courseId,
          title: item.courseTitle || "Course",
          completed,
          meta: completed
            ? `Completed${item.completedDate ? ` ${new Date(item.completedDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}` : ""}`
            : `${completion}% complete${live?.lastAccessedAt ? ` - Last activity ${new Date(live.lastAccessedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit" })}` : ""}`,
          action: completed ? "Review ->" : "Continue ->",
        };
      })
      .sort((a, b) => Number(a.completed) - Number(b.completed));
  }, [enrollments, liveProgressByCourseId]);

  const summaryStats = useMemo(() => {
    const active = enrollments.filter((item) => item.status === "ACTIVE").length;
    const completed = enrollments.filter((item) => item.status === "COMPLETED").length;
    const primary = Math.round(continueLearning[0]?.completionPercentage || 0);
    return [
      [String(active), "Active courses"],
      [`${primary}%`, "Primary path"],
      [String(completed), "Completed"],
    ] as const;
  }, [enrollments, continueLearning]);

  const featured = continueLearning[0];

  return (
    <main className="my-learning-page">
      <LearningSidebar activeHref="/my-learning" dashboard={dashboard} loading={loading} user={user} />

      <section className="my-learning-main">
        <header className="my-learning-header">
          <div>
            <h1>My Learning</h1>
            <p>All enrolled courses, organised by priority and progress.</p>
          </div>
          <button type="button" onClick={() => router.push("/explore")}>
            <BookOpen size={18} />
            <span>Browse courses</span>
          </button>
        </header>

        <section className="continue-learning-card">
          {loading ? <CardSkeleton lines={3} /> : (
            <>
              <h2>{featured ? `Continue ${featured.courseTitle}` : "No active courses yet"}</h2>
              <p>{featured ? "Progress loaded from your account." : "Browse the catalogue and enroll to start learning."}</p>
              <button
                type="button"
                onClick={() => (featured ? router.push(`/course?courseId=${encodeId(featured.courseId)}`) : router.push("/explore"))}
              >
                {featured ? "Continue learning ->" : "Browse courses ->"}
              </button>
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
            )) : courseRows.length ? courseRows.map((row) => (
              <article key={row.courseId} className={row.completed ? "done" : ""}>
                <div>
                  <h3>{row.title}</h3>
                  <p>
                    {row.completed && <CheckCircle2 size={14} />}
                    {row.meta}
                  </p>
                </div>
                <button type="button" onClick={() => router.push(`/course?courseId=${encodeId(row.courseId)}`)}>{row.action}</button>
              </article>
            )) : (
              <article>
                <div>
                  <h3>No courses enrolled</h3>
                  <p>Your courses will appear here after enrollment.</p>
                </div>
                <button type="button" onClick={() => router.push("/explore")}>Explore courses -&gt;</button>
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
                <button type="button" onClick={() => router.push("/progress")}>View progress -&gt;</button>
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
