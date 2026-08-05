"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "../components/AuthGuard";
import LearningSidebar from "../components/LearningSidebar";
import { PublicDashboardResponse, UserResponse, getCurrentUser, getPublicDashboard } from "../lib/backendApi";
import { encodeId } from "../lib/idCodec";

function MandatoryLearning() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [dashboard, setDashboard] = useState<PublicDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getCurrentUser(), getPublicDashboard()]).then(([u, d]) => {
      if (!active) return;
      if (u.status === "fulfilled") setUser(u.value);
      setDashboard(d.status === "fulfilled" ? d.value : null);
    }).finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const assigned = useMemo(() => dashboard?.continueLearning || [], [dashboard]);
  const featured = assigned[0];
  const completedCount = assigned.filter((item) => (item.completionPercentage || 0) >= 100).length;
  const inProgressCount = assigned.length - completedCount;

  return (
    <main className="mandatory-page">
      <LearningSidebar activeHref="/learning" dashboard={dashboard} loading={loading} user={user} />

      <section className="mandatory-main">
        <header className="mandatory-header">
          <div>
            <h1>Mandatory Learning</h1>
            <p>Learning assigned to your account.</p>
          </div>
        </header>

        {featured ? (
          <section className="mandatory-hero">
            <h2>{featured.courseTitle}</h2>
            <p>{Math.round(featured.completionPercentage || 0)}% complete</p>
            <button type="button" onClick={() => router.push(`/course?courseId=${encodeId(featured.courseId)}`)}>
              Continue course -&gt;
            </button>
          </section>
        ) : (
          <section className="mandatory-hero">
            <h2>No mandatory training assigned</h2>
            <p>You don&apos;t have any assigned learning right now.</p>
            <button type="button" onClick={() => router.push("/explore")}>Browse courses -&gt;</button>
          </section>
        )}

        <section className="mandatory-stats" aria-label="Assigned learning summary">
          <article>
            <strong>{assigned.length}</strong>
            <p>Assigned courses</p>
          </article>
          <article>
            <strong>{completedCount}</strong>
            <p>Completed</p>
          </article>
          <article>
            <strong>{inProgressCount}</strong>
            <p>In progress</p>
          </article>
        </section>

        <h2 className="assigned-training-title">Assigned learning</h2>

        <div className="mandatory-content-grid">
          <section className="assigned-training-list" aria-label="Assigned learning">
            {assigned.length ? (
              assigned.map((item) => (
                <article key={item.courseId}>
                  <div>
                    <h3>{item.courseTitle}</h3>
                    <p>{Math.round(item.completionPercentage || 0)}% complete</p>
                  </div>
                  <button type="button" onClick={() => router.push(`/course?courseId=${encodeId(item.courseId)}`)}>
                    Continue -&gt;
                  </button>
                </article>
              ))
            ) : (
              <article>
                <div>
                  <h3>No mandatory training assigned</h3>
                  <p>Check back later or explore courses to get started.</p>
                </div>
              </article>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

export default function MandatoryLearningPage() {
  return (
    <AuthGuard>
      <MandatoryLearning />
    </AuthGuard>
  );
}
