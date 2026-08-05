"use client";

import { BookOpen } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "../components/AuthGuard";
import LearningSidebar from "../components/LearningSidebar";
import { CardSkeleton } from "../components/Skeleton";
import { PublicDashboardResponse, UserResponse, getCurrentUser, getPublicDashboard } from "../lib/backendApi";
import { encodeId } from "../lib/idCodec";

function MyLearning() {
  const router = useRouter();
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
    return continueLearning.slice(0, 3).map((item) => ({
      courseId: item.courseId,
      title: item.courseTitle,
      meta: `${Math.round(item.completionPercentage || 0)}% complete${item.lastAccessedAt ? ` - Last activity ${new Date(item.lastAccessedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit" })}` : ""}`,
      action: "Continue ->",
    }));
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
              <article key={row.courseId}>
                <div>
                  <h3>{row.title}</h3>
                  <p>{row.meta}</p>
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
