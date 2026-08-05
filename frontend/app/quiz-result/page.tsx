"use client";

import { ArrowRight, Eye, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CardSkeleton } from "../components/Skeleton";
import AuthGuard from "../components/AuthGuard";
import { QuizResultSession, courseExitHref, loadQuizResult } from "../lib/quizSession";
import { decodeParam, encodeId } from "../lib/idCodec";

function formatDate(value?: string | null) {
  if (!value) return "Just now";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function QuizResultPassed() {
  const router = useRouter();
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [resultSession, setResultSession] = useState<QuizResultSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = decodeParam(new URLSearchParams(window.location.search), "assessmentId");
    setAssessmentId(id);
    setResultSession(id ? loadQuizResult(id) : null);
    setReady(true);
  }, []);

  const assessment = resultSession?.assessment;
  const result = resultSession?.result;

  function exitQuiz() {
    router.push(courseExitHref(assessment?.courseId));
  }

  if (ready && !resultSession) {
    return (
      <main className="quiz-result-page">
        <section className="quiz-result-content">
          <div className="quiz-result-heading">
            <p>No result found</p>
            <h1>We couldn't find a recent result for this assessment.</h1>
            <span>Results are only available right after you submit an attempt.</span>
          </div>
          <div className="result-actions">
            <button type="button" className="result-primary" onClick={() => router.push("/learning")}>
              <ArrowRight size={16} />
              <span>Go to learning home</span>
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="quiz-result-page">
      <header className="lesson-topbar">
        <div className="lesson-brand-block">
          <img src="/basecamp-logo.png" alt="BaseCamp" />
          <span />
          <section>
            <strong>{assessment?.title || "Assessment"}</strong>
            <p>{assessment?.type ? `${assessment.type} - Required assessment` : "Required assessment"}</p>
          </section>
        </div>
        <div className="lesson-top-actions">
          <p>Attempt {result?.attemptNumber || 1}</p>
          <button type="button" onClick={exitQuiz}>
            <X size={16} />
            <span>Exit quiz</span>
          </button>
        </div>
      </header>

      <section className="quiz-result-content">
        {!ready ? (
          <CardSkeleton lines={6} />
        ) : (
          <>
            <div className="quiz-result-heading">
              <p>Assessment complete</p>
              <h1>You passed {assessment?.title || "this assessment"}</h1>
              <span>Your result has been recorded.</span>
            </div>

            <section className="result-card">
              <header>
                <div>
                  <strong>{Math.round(result?.score || 0)}%</strong>
                  <p>Pass score {assessment?.passingScore ?? 0}%</p>
                </div>
                <span>Passed</span>
              </header>

              <div className="result-stat-grid">
                <article className="accent">
                  <strong>{formatDate(result?.submittedAt)}</strong>
                  <p>Completed</p>
                </article>
                <article>
                  <strong>{result?.attemptNumber || 1} of {assessment?.maxAttempts || 1}</strong>
                  <p>Attempts used</p>
                </article>
                <article className="success">
                  <strong>Unlocked</strong>
                  <p>Next lesson</p>
                </article>
              </div>
            </section>

            <div className="result-actions">
              <button
                type="button"
                className="result-secondary"
                onClick={() => assessment && router.push(`/quiz-review?assessmentId=${encodeId(assessment.id)}`)}
              >
                <Eye size={16} />
                <span>Review answers</span>
              </button>
              <button type="button" className="result-primary" onClick={exitQuiz}>
                <ArrowRight size={16} />
                <span>Continue course</span>
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default function QuizResultPage() {
  return (
    <AuthGuard>
      <QuizResultPassed />
    </AuthGuard>
  );
}
