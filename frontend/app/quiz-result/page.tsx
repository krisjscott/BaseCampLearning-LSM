import { ArrowRight, Eye, X } from "lucide-react";

const resultStats = [
  ["+350", "XP earned", "accent"],
  ["Jul 26, 2026", "Completed", ""],
  ["1 of 2", "Attempts used", ""],
  ["Unlocked", "Next lesson", "success"],
] as const;

export default function QuizResultPassed() {
  return (
    <main className="quiz-result-page">
      <header className="lesson-topbar">
        <div className="lesson-brand-block">
          <img src="/basecamp-logo.png" alt="BaseCamp" />
          <span />
          <section>
            <strong>Selected course</strong>
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

      <section className="quiz-result-content">
        <div className="quiz-result-heading">
          <p>Assessment complete</p>
          <h1>You passed Module 3</h1>
          <span>Your result has been recorded and the next lesson is now unlocked.</span>
        </div>

        <section className="result-card">
          <header>
            <div>
              <strong>92%</strong>
              <p>11 of 12 correct - Pass score 80%</p>
            </div>
            <span>Passed</span>
          </header>

          <div className="result-stat-grid">
            {resultStats.map(([value, label, tone]) => (
              <article className={tone} key={label}>
                <strong>{value}</strong>
                <p>{label}</p>
              </article>
            ))}
          </div>

          <p>Checkpoint completed - Scope and deliverables</p>
        </section>

        <div className="result-actions">
          <button type="button" className="result-secondary">
            <Eye size={16} />
            <span>Review answers</span>
          </button>
          <button type="button" className="result-primary">
            <ArrowRight size={16} />
            <span>Continue to Module 4</span>
          </button>
        </div>
      </section>
    </main>
  );
}

