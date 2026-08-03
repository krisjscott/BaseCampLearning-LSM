"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Circle, ClipboardList, X } from "lucide-react";
import { AssessmentResponse, getAssessment, submitAssessment } from "../lib/backendApi";

export default function CompulsoryQuiz() {
  const [assessment, setAssessment] = useState<AssessmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const assessmentId = new URLSearchParams(window.location.search).get("assessmentId");

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

  async function saveAndContinue() {
    if (!assessment || !currentQuestion) return;

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((value) => value + 1);
      return;
    }

    setSaving(true);
    setError("");
    try {
      await submitAssessment({
        assessmentId: assessment.id,
        answers: questions
          .filter((question) => selectedAnswers[question.id])
          .map((question) => ({
            questionId: question.id,
            selectedOptionId: selectedAnswers[question.id],
          })),
      });
      window.location.href = "/quiz-review";
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not submit assessment");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="quiz-page">
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
          <p>Attempt 1 of 2</p>
          <button type="button">
            <X size={16} />
            <span>Exit quiz</span>
          </button>
        </div>
      </header>

      <div className="quiz-shell">
        <section className="quiz-main">
          <header className="quiz-heading-row">
            <div>
              <p>{assessment?.type || "Assessment"}</p>
              <h1>{assessment?.title || (loading ? "Loading assessment" : "No assessment selected")}</h1>
              <span>{totalQuestions || 0} questions - Pass score: {assessment?.passingScore ?? 0}%</span>
            </div>
            <section className="autosave-status">
              <Check size={16} />
              <strong>{saving ? "Saving answers" : "Answers autosaved"}</strong>
              <span>{assessment?.maxAttempts ? `Maximum attempts: ${assessment.maxAttempts}` : "Assessment records save to the backend"}</span>
            </section>
          </header>

          <section className="question-card">
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
          </section>

          <footer className="quiz-actions">
            <button type="button" className="quiz-secondary" onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))}><ArrowLeft size={16} /><span>Previous</span></button>
            <button type="button" className="quiz-primary" onClick={saveAndContinue} disabled={!currentQuestion || saving}><span>{saving ? "Saving..." : "Save & continue"}</span><ArrowRight size={16} /></button>
          </footer>
        </section>

        <aside className="quiz-sidebar">
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
            <p>Answer all questions to submit.</p>
            <button type="button" disabled={!totalQuestions || answeredCount < totalQuestions}><ClipboardList size={16} /><span>Review &amp; submit</span></button>
          </section>
        </aside>
      </div>
    </main>
  );
}


