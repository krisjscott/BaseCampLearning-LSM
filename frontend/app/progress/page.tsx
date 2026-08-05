"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "../components/AuthGuard";
import LearningSidebar from "../components/LearningSidebar";
import { CardSkeleton } from "../components/Skeleton";
import {
  CertificateResponse,
  PublicDashboardResponse,
  UserResponse,
  getCertificates,
  getCurrentUser,
  getPublicDashboard,
} from "../lib/backendApi";
import { encodeId } from "../lib/idCodec";
import { getLevelProgress, levelMilestones } from "../lib/levelProgress";

function ProgressContent() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [dashboard, setDashboard] = useState<PublicDashboardResponse | null>(null);
  const [certificates, setCertificates] = useState<CertificateResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getCurrentUser(), getPublicDashboard(), getCertificates()])
      .then(([userResult, dashboardResult, certificateResult]) => {
        if (!active) return;
        if (userResult.status === "fulfilled") setUser(userResult.value);
        setDashboard(dashboardResult.status === "fulfilled" ? dashboardResult.value : null);
        setCertificates(certificateResult.status === "fulfilled" ? certificateResult.value : []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const courses = dashboard?.continueLearning || [];
  const recommendations = dashboard?.recommendedCourses || [];
  const activities = dashboard?.recentActivities || [];
  const xpPoints = Math.max(0, Math.round(dashboard?.xpPoints || 0));
  const level = getLevelProgress(xpPoints);
  const averageProgress = courses.length
    ? Math.round(courses.reduce((sum, item) => sum + (item.completionPercentage || 0), 0) / courses.length)
    : 0;
  const completedCourses = courses.filter((course) => (course.completionPercentage || 0) >= 100).length;
  const stats = [
    [courses.length.toLocaleString(), "Active courses"],
    [`${averageProgress}%`, "Average completion"],
    [certificates.length.toLocaleString(), "Certificates"],
  ] as const;

  const levelLabel = useMemo(() => {
    if (!level.next) return "Highest stage reached";
    return `${level.remaining.toLocaleString()} XP to ${level.next.name}`;
  }, [level.next, level.remaining]);

  return (
    <main className="progress-dashboard-page">
      <LearningSidebar activeHref="/progress" dashboard={dashboard} loading={loading} user={user} />

      <section className="progress-dashboard-main">
        <header className="progress-dashboard-header">
          <div>
            <h1>Progress</h1>
            <p>Learning completion, XP, levels and database-recorded activity.</p>
          </div>
        </header>

        <section className="progress-dashboard-hero">
          {loading ? (
            <CardSkeleton lines={3} />
          ) : (
            <>
              <h2>{courses.length ? "Your learning activity is live" : "No active progress yet"}</h2>
              <p>
                {courses.length
                  ? `${courses.length} course${courses.length === 1 ? "" : "s"} and ${activities.length} recent activit${activities.length === 1 ? "y" : "ies"} are powering this view.`
                  : "Enroll in a course and your progress cards will populate from the database."}
              </p>
              <button type="button" onClick={() => router.push("/achievements")}>View insights -&gt;</button>
            </>
          )}
        </section>

        <section className="progress-dashboard-stats" aria-label="Progress summary">
          {loading ? Array.from({ length: 3 }, (_, index) => <CardSkeleton key={index} lines={2} />) : stats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="progress-by-course-title">Progress by course</h2>

        <div className="progress-dashboard-grid">
          <section className="course-progress-list" aria-label="Progress by course">
            {loading ? Array.from({ length: 3 }, (_, index) => <CardSkeleton key={index} lines={2} />) : courses.length ? courses.map((course) => {
              const progress = Math.round(course.completionPercentage || 0);
              return (
                <article key={course.courseId}>
                  <div>
                    <h3>{course.courseTitle}</h3>
                    <p>{progress}% - {progress >= 100 ? "Completed" : progress > 0 ? "In progress" : "Ready to start"}</p>
                  </div>
                  <button type="button" onClick={() => router.push(`/course?courseId=${encodeId(course.courseId)}`)}>Details -&gt;</button>
                </article>
              );
            }) : (
              <article className="empty-state-card">
                <div>
                  <h3>No course progress found</h3>
                  <p>Backend course progress will appear here once the learner starts a course.</p>
                </div>
              </article>
            )}
          </section>

          <aside className="current-level-card">
            {loading ? (
              <CardSkeleton lines={6} />
            ) : (
              <>
                <div className="current-level-card-header">
                  <section>
                    <p>Current level</p>
                    <h2>{level.current.name}</h2>
                  </section>
                </div>
                <div className="current-level-xp">
                  <strong>{xpPoints.toLocaleString()}</strong>
                  <span>{level.current.nextXp == null ? "XP earned" : `/ ${level.target.toLocaleString()} XP`}</span>
                </div>
                <div className="current-level-meter" aria-label={`${level.percentage} percent toward ${level.next?.name || "top level"}`}>
                  <span style={{ width: `${level.percentage}%` }} />
                </div>
                <div className="current-level-next">
                  <span>{level.next ? "Next stage" : "Level status"}</span>
                  <strong>{level.next?.name || "Champion"}</strong>
                </div>
                <div className="current-level-pill-row" aria-label="Level milestones">
                  {levelMilestones.map((milestone) => (
                    <span className={milestone.name === level.current.name ? "active" : ""} key={milestone.name}>
                      {milestone.name}
                    </span>
                  ))}
                </div>
                <button type="button" onClick={() => router.push("/explore")}>
                  <span>{levelLabel}</span>
                  <ArrowRight size={17} strokeWidth={2.3} />
                </button>
              </>
            )}
          </aside>
        </div>

        <section className="progress-support-grid" aria-label="Progress details">
          {loading ? Array.from({ length: 3 }, (_, index) => <CardSkeleton key={index} lines={3} />) : (
            <>
              <article className="weekly-goal-card">
                <h2>Weekly goal</h2>
                <strong>{completedCourses} / {Math.max(courses.length, 1)}</strong>
                <p>{courses.length ? "Courses completed from active learning." : "No weekly learning goal has started yet."}</p>
              </article>
              <article className="recommended-path-card">
                <h2>Recommended path</h2>
                <strong>{recommendations.length ? recommendations[0].courseTitle : "No recommendation yet"}</strong>
                <p>{recommendations.length ? `${recommendations.length} backend recommendation${recommendations.length === 1 ? "" : "s"} available.` : "Onboarding and course data will generate recommendations."}</p>
              </article>
              <article className="public-profile-card">
                <h2>Public profile</h2>
                <strong>{user?.learnerCode || "Profile code pending"}</strong>
                <p>{certificates.length} certificate{certificates.length === 1 ? "" : "s"} connected to this learner.</p>
              </article>
            </>
          )}
        </section>
      </section>
    </main>
  );
}

export default function ProgressDashboard() {
  return (
    <AuthGuard>
      <ProgressContent />
    </AuthGuard>
  );
}
