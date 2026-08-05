"use client";

import { AlertTriangle, ClipboardList, ListChecks, Percent, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "../components/AuthGuard";
import LearningSidebar from "../components/LearningSidebar";
import { CardSkeleton } from "../components/Skeleton";
import { PublicDashboardResponse, UserResponse, getCurrentUser, getPublicDashboard } from "../lib/backendApi";
import { QuizResultSession, clearQuizResult, loadQuizResult } from "../lib/quizSession";
import { decodeParam, encodeId } from "../lib/idCodec";

function formatDate(value?: string | null) {
  if (!value) return "Just now";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function QuizResultRetakeRequired() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [dashboard, setDashboard] = useState<PublicDashboardResponse | null>(null);
  const [resultSession, setResultSession] = useState<QuizResultSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getCurrentUser(), getPublicDashboard()])
      .then(([userResult, dashboardResult]) => {
        if (!active) return;
        if (userResult.status === "fulfilled") setUser(userResult.value);
        setDashboard(dashboardResult.status === "fulfilled" ? dashboardResult.value : null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const id = decodeParam(new URLSearchParams(window.location.search), "assessmentId");
    setResultSession(id ? loadQuizResult(id) : null);
    setReady(true);

    return () => {
      active = false;
    };
  }, []);

  const assessment = resultSession?.assessment;
  const result = resultSession?.result;

  function startRetake() {
    if (!assessment) return;
    clearQuizResult();
    router.push(`/quiz?assessmentId=${encodeId(assessment.id)}`);
  }

  return (
    <main className="certificate-detail-page quiz-result-retake-required-page">
      <LearningSidebar activeHref="/learning" dashboard={dashboard} loading={loading} user={user} />

      <section className="certificate-detail-main">
        {!ready ? (
          <CardSkeleton lines={6} />
        ) : !resultSession ? (
          <>
            <header className="certificate-detail-header">
              <div>
                <h1>No result found</h1>
                <p>We couldn't find a recent attempt to show here.</p>
              </div>
            </header>
            <button type="button" onClick={() => router.push("/learning")}>Go to learning home</button>
          </>
        ) : (
          <>
            <header className="certificate-detail-header">
              <div>
                <h1>Assessment result</h1>
                <p>Your attempt was recorded, but the pass score was not reached.</p>
              </div>
              <button type="button" onClick={startRetake}>
                <RotateCcw size={18} />
                <span>Start retake</span>
              </button>
            </header>

            <section className="certificate-detail-hero">
              <AlertTriangle size={28} />
              <h2>Score: {Math.round(result?.score || 0)}% - Pass score: {assessment?.passingScore ?? 0}%</h2>
              <p>Attempt {result?.attemptNumber || 1} of {assessment?.maxAttempts || 1} - Completed {formatDate(result?.submittedAt)}.</p>
              <button type="button" onClick={() => assessment && router.push(`/quiz-review?assessmentId=${encodeId(assessment.id)}`)}>
                <ClipboardList size={15} />
                <span>Review attempt -&gt;</span>
              </button>
            </section>

            <section className="certificate-detail-stats" aria-label="Assessment result summary">
              <article>
                <Percent size={18} />
                <strong>{Math.round(result?.score || 0)}%</strong>
                <p>Score</p>
              </article>
              <article>
                <RotateCcw size={18} />
                <strong>{result?.attemptNumber || 1} of {assessment?.maxAttempts || 1}</strong>
                <p>Attempts used</p>
              </article>
            </section>

            <h2 className="share-certificate-title">Before you retake</h2>

            <div className="certificate-detail-grid">
              <aside className="verification-card">
                <h2>Retake rule</h2>
                <p>You have {Math.max((assessment?.maxAttempts || 1) - (result?.attemptNumber || 1), 0)} attempt(s) remaining for this assessment.</p>
                <button type="button" onClick={() => assessment && router.push(`/quiz-review?assessmentId=${encodeId(assessment.id)}`)}>
                  <ListChecks size={15} />
                  <span>Review your answers -&gt;</span>
                </button>
              </aside>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default function QuizResultRetakeRequiredPage() {
  return (
    <AuthGuard>
      <QuizResultRetakeRequired />
    </AuthGuard>
  );
}
