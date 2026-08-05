"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Circle, ClipboardList, X } from "lucide-react";
import { AssessmentResponse, getAssessment } from "../lib/backendApi";
import { CardSkeleton, Skeleton } from "../components/Skeleton";
import AuthGuard from "../components/AuthGuard";
import { courseExitHref, saveQuizSession } from "../lib/quizSession";
import { decodeParam, encodeId } from "../lib/idCodec";

function CompulsoryQuiz() {
  const router = useRouter();
  const [assessment, setAssessment] = useState<AssessmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    const assessmentId = decodeParam(new URLSearchParams(window.location.search), "assessmentId");

    if (!assessmentId) {
      setLoading(false);
      return;
    }

    getAssessment(assessmentId)
      .then(setAssessment)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load assessment"))
      .finally(() => setLoading(false));
  }, []);

  const questions = useMemo(
    () => [...(assessment?.questions || [])].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)),
    [assessment],
  );
  const currentQuestion = questions[currentIndex];
  const options = currentQuestion?.options || [];
  const selectedAnswer = currentQuestion ? selectedAnswers[currentQuestion.id] || "" : "";
  const answeredCount = Object.keys(selectedAnswers).filter((questionId) => selectedAnswers[questionId]).length;
  const totalQuestions = questions.length || 0;
  const progress = totalQuestions ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const isLastQuestion = currentIndex >= questions.length - 1;
  const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions;

  function goToNext() {
    if (!currentQuestion || isLastQuestion) return;
    setCurrentIndex((value) => value + 1);
  }

  function goToReview() {
    if (!assessment || !allAnswered) return;
    saveQuizSession({ assessment, selectedAnswers });
    router.push(`/quiz-review?assessmentId=${encodeId(assessment.id)}`);
  }

  function exitQuiz() {
    router.push(courseExitHref(assessment?.courseId));
  }

  return (
    <main className="quiz-page">
      <header className="lesson-topbar">
        <div className="lesson-brand-block">
          <img src="/basecamp-logo.png" alt="BaseCamp" />
          <span />
          <section>
            {loading ? (
              <>
                <Skeleton className="skeleton-copy" />
                <Skeleton className="skeleton-copy" />
              </>
            ) : (
              <>
                <strong>{assessment?.title || "Assessment"}</strong>
                <p>{assessment?.type ? `${assessment.type} - Required assessment` : "Required assessment"}</p>
              </>
            )}
          </section>
        </div>
        <div className="lesson-top-actions">
          <p>Attempt 1 of 2</p>
          <button type="button" onClick={exitQuiz}>
            <X size={16} />
            <span>Exit quiz</span>
          </button>
        </div>
      </header>

      <div className="quiz-shell">
        <section className="quiz-main">
          <header className="quiz-heading-row">
            <div>
              {loading ? (
                <>
                  <Skeleton className="skeleton-pill" />
                  <Skeleton className="skeleton-title" />
                  <Skeleton className="skeleton-copy" />
                </>
              ) : (
                <>
                  <p>{assessment?.type || "Assessment"}</p>
                  <h1>{assessment?.title || "No assessment selected"}</h1>
                  <span>{totalQuestions || 0} questions - Pass score: {assessment?.passingScore ?? 0}%</span>
                </>
              )}
            </div>
            <section className="autosave-status">
              {loading ? <CardSkeleton lines={2} /> : (
                <>
                  <Check size={16} />
                  <strong>{answeredCount} of {totalQuestions} answered</strong>
                  <span>{assessment?.maxAttempts ? `Maximum attempts: ${assessment.maxAttempts}` : "Answer every question, then review and submit"}</span>
                </>
              )}
            </section>
          </header>

          <section className="question-card">
            {loading ? (
              <CardSkeleton lines={7} />
            ) : (
              <>
                <div className="question-meta">
                  <p>Question {currentQuestion ? currentIndex + 1 : 0} of {totalQuestions}</p>
                  <span>{currentQuestion?.points || 0} point</span>
                </div>
                <h2>{currentQuestion?.questionText || "Open an assessment from a course to answer questions."}</h2>
                <p>{error || "Select one answer."}</p>

                <div className="answer-list" role="radiogroup" aria-label="Answer choices">
                  {options.length ? options.map((option, index) => {
                    const selected = selectedAnswer === option.id;
                    const letter = String.fromCharCode(65 + index);
                    return (
                      <button
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={`answer-choice${selected ? " selected" : ""}`}
                        key={option.id}
                        onClick={() => currentQuestion && setSelectedAnswers((current) => ({ ...current, [currentQuestion.id]: option.id }))}
                      >
                        <span>{selected ? <Check size={18} /> : letter}</span>
                        <p>{option.optionText}</p>
                      </button>
                    );
                  }) : (
                    <article className="answer-choice">
                      <span>-</span>
                      <p>No answer options were returned by the backend for this question.</p>
                    </article>
                  )}
                </div>
              </>
            )}
          </section>

          <footer className="quiz-actions">
            <button type="button" className="quiz-secondary" onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))} disabled={currentIndex === 0}><ArrowLeft size={16} /><span>Previous</span></button>
            <button type="button" className="quiz-primary" onClick={goToNext} disabled={!currentQuestion || isLastQuestion}><span>Next question</span><ArrowRight size={16} /></button>
          </footer>
        </section>

        <aside className="quiz-sidebar">
          {loading ? <CardSkeleton lines={8} /> : (
            <>
              <header>
                <h2>Quiz progress</h2>
                <p>{answeredCount} of {totalQuestions} answered</p>
              </header>

              <div className="quiz-progress">
                <span style={{ width: `${progress}%` }} />
              </div>

              <div className="quiz-legend">
                <span>
                  <CheckCircle2 size={16} />
                  Answered
                </span>
                <span>
                  <Circle size={16} />
                  Unanswered
                </span>
              </div>

              <div className="question-grid" aria-label="Question navigation">
                {Array.from({ length: Math.max(totalQuestions, 1) }, (_, index) => {
                  const number = index + 1;
                  const question = questions[index];
                  const current = index === currentIndex;
                  const isAnswered = question ? Boolean(selectedAnswers[question.id]) : false;
                  return (
                    <button
                      type="button"
                      className={`${current ? "current" : ""}${isAnswered ? " answered" : ""}`}
                      key={number}
                      onClick={() => question && setCurrentIndex(index)}
                      disabled={!question}
                    >
                      {number}
                    </button>
                  );
                })}
              </div>

              <hr />

              <section className="attempt-rules">
                <h2>Attempt rules</h2>
                <ul>
                  <li>Passing score: {assessment?.passingScore ?? 0}%</li>
                  <li>Maximum attempts: {assessment?.maxAttempts || 0}</li>
                  <li>Answers cannot be changed after submission</li>
                  <li>Results are recorded with date and time</li>
                </ul>
              </section>

              <section className="submit-card">
                <p>{allAnswered ? "Ready to review and submit." : "Answer all questions to submit."}</p>
                <button type="button" onClick={goToReview} disabled={!allAnswered}><ClipboardList size={16} /><span>Review &amp; submit</span></button>
              </section>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}

export default function QuizPage() {
  return (
    <AuthGuard>
      <CompulsoryQuiz />
    </AuthGuard>
  );
}
