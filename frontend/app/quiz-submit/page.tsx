import { Check, ClipboardCheck, Eye, X } from "lucide-react";

export default function QuizSubmissionConfirmation() {
  return (
    <main className="quiz-submit-page">
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

      <section className="quiz-submit-content">
        <article className="submit-confirm-card">
          <div className="submit-check">
            <Check size={24} />
          </div>
          <h1>Submit your assessment?</h1>
          <p>You answered all 12 questions. Once submitted, this attempt cannot be edited.</p>
          <span>Attempt 1 of 2 - Recorded Jul 26, 2026</span>

          <div className="submit-confirm-actions">
            <button type="button" className="keep-reviewing">
              <Eye size={16} />
              <span>Keep reviewing</span>
            </button>
            <button type="button" className="submit-now">
              <ClipboardCheck size={16} />
              <span>Submit now</span>
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}

