"use client";

import { BookOpen } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "../components/AuthGuard";
import LearningSidebar from "../components/LearningSidebar";
import { CardSkeleton } from "../components/Skeleton";
import {
  CertificateResponse,
  CourseResponse,
  PublicDashboardResponse,
  UserResponse,
  getCertificates,
  getCourses,
  getCurrentUser,
  getPublicDashboard,
} from "../lib/backendApi";
import { encodeId } from "../lib/idCodec";
import { getLevelProgress } from "../lib/levelProgress";

function MyLearningEmptyContent() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [dashboard, setDashboard] = useState<PublicDashboardResponse | null>(null);
  const [certificates, setCertificates] = useState<CertificateResponse[]>([]);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getCurrentUser(), getPublicDashboard(), getCertificates(), getCourses(3)])
      .then(([userResult, dashboardResult, certificateResult, coursesResult]) => {
        if (!active) return;
        if (userResult.status === "fulfilled") setUser(userResult.value);
        setDashboard(dashboardResult.status === "fulfilled" ? dashboardResult.value : null);
        setCertificates(certificateResult.status === "fulfilled" ? certificateResult.value : []);
        setCourses(coursesResult.status === "fulfilled" ? coursesResult.value?.content || [] : []);
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
  const xpPoints = Math.max(0, Math.round(dashboard?.xpPoints || 0));
  const level = getLevelProgress(xpPoints);

  const stats = [
    [String(continueLearning.length), "Active courses"],
    [String(certificates.length), "Certificates"],
    [level.current.name, "Current level"],
  ] as const;

  const recommendations = useMemo(() => {
    const fromDashboard = (dashboard?.recommendedCourses || []).slice(0, 3).map((course) => ({
      id: course.courseId,
      title: course.courseTitle,
      meta: course.instructorName || "Recommended",
    }));
    if (fromDashboard.length) return fromDashboard;
    return courses.slice(0, 3).map((course) => ({
      id: course.id,
      title: course.title,
      meta: course.categoryName || course.status || "Course",
    }));
  }, [dashboard, courses]);

  return (
    <main className="certificate-detail-page my-learning-empty-page">
      <LearningSidebar activeHref="/my-learning" dashboard={dashboard} loading={loading} user={user} />

      <section className="certificate-detail-main">
        <header className="certificate-detail-header">
          <div>
            <h1>My Learning</h1>
            <p>Your enrolled courses will appear here.</p>
          </div>
          <button type="button" onClick={() => router.push("/explore")}>
            <BookOpen size={18} />
            <span>Explore courses</span>
          </button>
        </header>

        <section className="certificate-detail-hero">
          <h2>Start your first learning path</h2>
          <p>Choose a course or accept an assignment to begin tracking progress.</p>
          <button type="button" onClick={() => router.push("/explore")}>Explore courses -&gt;</button>
        </section>

        <section className="certificate-detail-stats" aria-label="Empty learning summary">
          {loading ? Array.from({ length: 3 }, (_, index) => <CardSkeleton key={index} lines={2} />) : stats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="share-certificate-title">Recommended starting points</h2>

        <div className="certificate-detail-grid">
          <section className="certificate-share-list" aria-label="Recommended starting points">
            {loading ? Array.from({ length: 3 }, (_, index) => <CardSkeleton key={index} lines={2} />) : recommendations.length ? recommendations.map((item) => (
              <article key={item.id}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.meta}</p>
                </div>
                <button type="button" onClick={() => router.push(`/course?courseId=${encodeId(item.id)}`)}>View -&gt;</button>
              </article>
            )) : (
              <article>
                <div>
                  <h3>No recommendations yet</h3>
                  <p>Browse the catalogue to find a course to start.</p>
                </div>
                <button type="button" onClick={() => router.push("/explore")}>Explore courses -&gt;</button>
              </article>
            )}
          </section>

          <aside className="verification-card">
            <h2>How enrolment works</h2>
            <p>Start a public course or receive an assigned course.</p>
            <button type="button" onClick={() => router.push("/explore")}>Learn more -&gt;</button>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default function MyLearningEmptyStateDesktop() {
  return (
    <AuthGuard>
      <MyLearningEmptyContent />
    </AuthGuard>
  );
}
