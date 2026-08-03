import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, X } from "lucide-react";

const reviewGroups = ["Questions 1-4", "Questions 5-8", "Questions 9-12"];

export default function QuizReviewSubmit() {
  return (
    <main className="quiz-review-page">
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

      <section className="quiz-review-content">
        <div className="quiz-review-heading">
          <h1>Review your answers</h1>
          <p>Check every response before submitting. Answers cannot be changed afterwards.</p>
        </div>

        <section className="review-card">
          <h2>12 of 12 answered</h2>
          <div className="review-group-list">
            {reviewGroups.map((label) => (
              <article className="review-group-row" key={label}>
                <strong>{label}</strong>
                <CheckCircle2 size={18} />
                <button type="button">
                  <span>Answered</span>
                  <span>Edit</span>
                  <ArrowRight size={16} />
                </button>
              </article>
            ))}
          </div>
          <div className="submit-note">
            <p>Submitting records this attempt with the current date and time.</p>
          </div>
        </section>

        <div className="review-actions">
          <button type="button" className="review-back">
            <ArrowLeft size={16} />
            <span>Back to questions</span>
          </button>
          <button type="button" className="review-submit">
            <ClipboardCheck size={16} />
            <span>Submit assessment</span>
          </button>
        </div>
      </section>
    </main>
  );
}

