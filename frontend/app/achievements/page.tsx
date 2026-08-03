"use client";

import { Award, BarChart3, BookOpen, Check, Compass, Home, LockKeyhole, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AuthGuard from "../components/AuthGuard";
import LearningSidebar from "../components/LearningSidebar";
import { CardSkeleton, Skeleton } from "../components/Skeleton";
import {
  CertificateResponse,
  PublicDashboardResponse,
  UserResponse,
  getCertificates,
  getCurrentUser,
  getPublicDashboard,
} from "../lib/backendApi";
import { getLevelProgress, levelMilestones } from "../lib/levelProgress";

function formatDate(value?: string | null) {
  if (!value) return "Recently recorded";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function AchievementsContent() {
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

  const xpPoints = Math.max(0, Math.round(dashboard?.xpPoints || 0));
  const level = getLevelProgress(xpPoints);
  const activeCourses = dashboard?.continueLearning?.length || 0;
  const recentActivities = dashboard?.recentActivities || [];
  const stats = [
    [certificates.length.toLocaleString(), "Certificates"],
    [xpPoints.toLocaleString(), "Total XP"],
    [level.current.name, "Current level"],
  ] as const;

  const recentAchievements = useMemo(() => {
    const certificateItems = certificates.slice(0, 3).map((certificate) => ({
      title: certificate.title || certificate.courseName || "Certificate earned",
      detail: `${certificate.certificateNumber} - ${formatDate(certificate.issuedDate)}`,
    }));
    const activityItems = recentActivities.slice(0, Math.max(0, 3 - certificateItems.length)).map((activity) => ({
      title: activity.activityType || "Learning activity",
      detail: `${activity.description} - ${formatDate(activity.activityDate)}`,
    }));
    return [...certificateItems, ...activityItems];
  }, [certificates, recentActivities]);

  return (
    <main className="achievements-page">
      <LearningSidebar activeHref="/achievements" dashboard={dashboard} loading={loading} user={user} />

      <section className="achievements-main">
        <header className="achievements-header">
          <div>
            <h1>Achievements</h1>
            <p>Milestones, levels, certificates and recorded learning wins.</p>
          </div>
          <button type="button">
            <Trophy size={18} />
            <span>Share profile</span>
          </button>
        </header>

        <section className="achievements-hero">
          {loading ? (
            <CardSkeleton lines={3} />
          ) : (
            <>
              <h2>{level.next ? `Next level: ${level.next.name}` : "Top level reached"}</h2>
              <p>
                {level.next
                  ? `Earn ${level.remaining.toLocaleString()} more XP through courses, quizzes and certificates.`
                  : "Your latest passed assessments have taken you to the highest level."}
              </p>
              <button type="button">View level path -&gt;</button>
            </>
          )}
        </section>

        <section className="achievements-stats" aria-label="Achievements summary">
          {loading ? Array.from({ length: 3 }, (_, index) => <CardSkeleton key={index} lines={2} />) : stats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="recent-achievements-title">Recent achievements</h2>

        <div className="achievements-grid">
          <section className="achievement-list" aria-label="Recent achievements">
            {loading ? Array.from({ length: 3 }, (_, index) => <CardSkeleton key={index} lines={2} />) : recentAchievements.length ? recentAchievements.map(({ title, detail }) => (
              <article key={`${title}-${detail}`}>
                <div>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </div>
                <button type="button">Share -&gt;</button>
              </article>
            )) : (
              <article className="empty-state-card">
                <div>
                  <h3>No achievements recorded yet</h3>
                  <p>Complete lessons, assessments, or certificates to populate this page from the database.</p>
                </div>
              </article>
            )}
          </section>

          <aside className="level-ladder-card">
            <h2>Level ladder</h2>
            {loading ? (
              <CardSkeleton lines={5} />
            ) : (
              <div className="level-ladder-steps" aria-label="Starter to Champion level ladder">
                {levelMilestones.map((milestone, index) => {
                  const state = index < level.currentIndex
                    ? "done"
                    : index === level.currentIndex
                      ? "current"
                      : index === level.currentIndex + 1
                        ? "next"
                        : "locked";
                  const label = state === "done" ? "Completed" : state === "current" ? "You are here" : state === "next" ? "Next stage" : "Locked";
                  return (
                    <div className={`ladder-step ${state}`} key={milestone.name}>
                      <span className="ladder-step-number">
                        {state === "done" ? <Check size={15} strokeWidth={2.7} /> : state === "locked" ? <LockKeyhole size={14} strokeWidth={2.3} /> : index + 1}
                      </span>
                      <section className="ladder-step-copy">
                        <span>{label}</span>
                        <strong>{milestone.name}</strong>
                        <small>{milestone.minXp.toLocaleString()} XP</small>
                      </section>
                    </div>
                  );
                })}
              </div>
            )}
            <p>{activeCourses ? `${activeCourses} active course${activeCourses === 1 ? "" : "s"} feeding this progress.` : "Start a course to begin collecting XP."}</p>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default function AchievementsPage() {
  return (
    <AuthGuard>
      <AchievementsContent />
    </AuthGuard>
  );
}
