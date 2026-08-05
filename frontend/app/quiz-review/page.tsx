"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, Circle, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { submitAssessment } from "../lib/backendApi";
import AuthGuard from "../components/AuthGuard";
import {
  QuizResultSession,
  QuizSession,
  clearQuizSession,
  courseExitHref,
  loadQuizResult,
  loadQuizSession,
  saveQuizResult,
} from "../lib/quizSession";
import { CardSkeleton } from "../components/Skeleton";
import { decodeParam, encodeId } from "../lib/idCodec";

function QuizReviewSubmit() {
  const router = useRouter();
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [resultSession, setResultSession] = useState<QuizResultSession | null>(null);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = decodeParam(new URLSearchParams(window.location.search), "assessmentId");
    setAssessmentId(id);

    if (!id) {
      setReady(true);
      return;
    }

    const existingResult = loadQuizResult(id);
    if (existingResult) {
      setResultSession(existingResult);
      setReady(true);
      return;
    }

    const existingSession = loadQuizSession(id);
    if (!existingSession) {
      router.replace(`/quiz?assessmentId=${encodeId(id)}`);
      return;
    }

    setSession(existingSession);
    setReady(true);
  }, [router]);

  const readOnly = Boolean(resultSession);
  const assessment = resultSession?.assessment || session?.assessment;
  const selectedAnswers = resultSession?.selectedAnswers || session?.selectedAnswers || {};

  const questions = useMemo(
    () => [...(assessment?.questions || [])].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)),
    [assessment],
  );

  const answeredCount = questions.filter((question) => selectedAnswers[question.id]).length;

  function answerText(questionId: string) {
    const question = questions.find((item) => item.id === questionId);
    const optionId = selectedAnswers[questionId];
    const option = question?.options?.find((item) => item.id === optionId);
    return option?.optionText || "Not answered";
  }

  function exitQuiz() {
    router.push(courseExitHref(assessment?.courseId));
  }

  async function handleSubmit() {
    if (!session || !assessment) return;
    setSubmitting(true);
    setError("");

    try {
      const result = await submitAssessment({
        assessmentId: assessment.id,
        answers: questions
          .filter((question) => selectedAnswers[question.id])
          .map((question) => ({
            questionId: question.id,
            selectedOptionId: selectedAnswers[question.id],
          })),
      });

      if (!result) {
        throw new Error("No result was returned for this attempt.");
      }

      clearQuizSession();
      saveQuizResult({ assessment, selectedAnswers, result });
      router.push(result.passed ? `/quiz-result?assessmentId=${encodeId(assessment.id)}` : `/quiz-result-retake-required?assessmentId=${encodeId(assessment.id)}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not submit assessment");
      setSubmitting(false);
    }
  }

  return (
    <main className="quiz-review-page">
      <header className="lesson-topbar">
        <div className="lesson-brand-block">
          <img src="/basecamp-logo.png" alt="BaseCamp" />
          <span />
          <section>
            <strong>{assessment?.title || "Assessment"}</strong>
            <p>{readOnly ? "Submitted attempt - read only" : "Review your answers before submitting"}</p>
          </section>
        </div>
        <div className="lesson-top-actions">
          <p>Attempt {resultSession?.result.attemptNumber || 1}</p>
          <button type="button" onClick={exitQuiz}>
            <X size={16} />
            <span>Exit quiz</span>
          </button>
        </div>
      </header>

      <section className="quiz-review-content">
        <div className="quiz-review-heading">
          <h1>{readOnly ? "Your submitted answers" : "Review your answers"}</h1>
          <p>
            {readOnly
              ? "This attempt has already been recorded. Answers cannot be changed."
              : "Check every response before submitting. Answers cannot be changed afterwards."}
          </p>
        </div>

        {!ready ? (
          <CardSkeleton lines={6} />
        ) : !assessment ? (
          <section className="review-card">
            <p>No assessment is loaded. Open a quiz from your course to review it.</p>
          </section>
        ) : (
          <>
            <section className="review-card">
              <h2>{answeredCount} of {questions.length} answered</h2>
              <div className="review-group-list">
                {questions.map((question, index) => {
                  const answered = Boolean(selectedAnswers[question.id]);
                  return (
                    <article className="review-group-row" key={question.id}>
                      <strong>Q{index + 1}. {question.questionText}</strong>
                      {answered ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                      {readOnly ? (
                        <span>{answerText(question.id)}</span>
                      ) : (
                        <button type="button" onClick={() => router.push(`/quiz?assessmentId=${encodeId(assessment.id)}`)}>
                          <span>{answered ? answerText(question.id) : "Not answered"}</span>
                          <span>Edit</span>
                          <ArrowRight size={16} />
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>
              {!readOnly && (
                <div className="submit-note">
                  <p>{error || "Submitting records this attempt with the current date and time."}</p>
                </div>
              )}
            </section>

            <div className="review-actions">
              {readOnly ? (
                <button
                  type="button"
                  className="review-back"
                  onClick={() => router.push(`${resultSession?.result.passed ? "/quiz-result" : "/quiz-result-retake-required"}?assessmentId=${encodeId(assessment.id)}`)}
                >
                  <ArrowLeft size={16} />
                  <span>Back to result</span>
                </button>
              ) : (
                <>
                  <button type="button" className="review-back" onClick={() => router.push(`/quiz?assessmentId=${encodeId(assessment.id)}`)}>
                    <ArrowLeft size={16} />
                    <span>Back to questions</span>
                  </button>
                  <button type="button" className="review-submit" onClick={handleSubmit} disabled={submitting}>
                    <ClipboardCheck size={16} />
                    <span>{submitting ? "Submitting..." : "Submit assessment"}</span>
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default function QuizReviewPage() {
  return (
    <AuthGuard>
      <QuizReviewSubmit />
    </AuthGuard>
  );
}
