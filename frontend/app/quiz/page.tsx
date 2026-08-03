"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Circle, ClipboardList, X } from "lucide-react";

const answers = [
  ["A", "A list of all people who may influence the project"],
  ["B", "A measurable output produced to meet a project objective"],
  ["C", "The total time allocated to every team member"],
  ["D", "A record of risks discovered after project completion"],
] as const;

const answered = new Set([1, 2, 3, 4, 7, 8, 10]);

export default function CompulsoryQuiz() {
  const [selectedAnswer, setSelectedAnswer] = useState("B");

  return (
    <main className="quiz-page">
      <header className="lesson-topbar">
        <div className="lesson-brand-block">
          <img src="/basecamp-logo.png" alt="BaseCamp" />
          <span />
          <section>
            <strong>Google Project Management</strong>
            <p>Module checkpoint - Required assessment</p>
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
              <p>Module 3 checkpoint</p>
              <h1>Scope and deliverables quiz</h1>
              <span>12 questions - Pass score: 80%</span>
            </div>
            <section className="autosave-status">
              <Check size={16} />
              <strong>Answers autosaved</strong>
              <span>Started Jul 26, 2026 - 05:04</span>
            </section>
          </header>

          <section className="question-card">
            <div className="question-meta">
              <p>Question 5 of 12</p>
              <span>1 point</span>
            </div>
            <h2>Which statement best defines a project deliverable?</h2>
            <p>Select one answer.</p>

            <div className="answer-list" role="radiogroup" aria-label="Answer choices">
              {answers.map(([letter, answer]) => {
                const selected = selectedAnswer === letter;
                return (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`answer-choice${selected ? " selected" : ""}`}
                    key={letter}
                    onClick={() => setSelectedAnswer(letter)}
                  >
                    <span>{selected ? <Check size={18} /> : letter}</span>
                    <p>{answer}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <footer className="quiz-actions">
            <button type="button" className="quiz-secondary"><ArrowLeft size={16} /><span>Previous</span></button>
            <button type="button" className="quiz-primary"><span>Save &amp; continue</span><ArrowRight size={16} /></button>
          </footer>
        </section>

        <aside className="quiz-sidebar">
          <header>
            <h2>Quiz progress</h2>
            <p>8 of 12 answered</p>
          </header>

          <div className="quiz-progress">
            <span />
          </div>

          <div className="quiz-legend">
            <span>
              <Check size={16} />
              Answered
            </span>
            <span>
              <Circle size={16} />
              Unanswered
            </span>
          </div>

          <div className="question-grid" aria-label="Question navigation">
            {Array.from({ length: 12 }, (_, index) => {
              const number = index + 1;
              const current = number === 5;
              const isAnswered = answered.has(number) || current;
              return (
                <button
                  type="button"
                  className={`${current ? "current" : ""}${isAnswered ? " answered" : ""}`}
                  key={number}
                >
                  {number}
                </button>
              );
            })}
          </div>

          <hr />

          <section className="attempt-rules">
            <h2>Attempt rules</h2>
            <p>
              Passing score: 80% - Maximum attempts: 2 - Answers cannot be changed after
              submission - Results are recorded with date and time
            </p>
          </section>

          <section className="submit-card">
            <p>Answer all questions to submit.</p>
            <button type="button"><ClipboardList size={16} /><span>Review &amp; submit</span></button>
          </section>
        </aside>
      </div>
    </main>
  );
}


