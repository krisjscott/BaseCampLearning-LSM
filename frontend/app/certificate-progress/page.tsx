import { ArrowRight, X } from "lucide-react";

export default function CertificateProgressUnlocked() {
  return (
    <main className="certificate-progress-page">
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

      <section className="certificate-progress-content">
        <p>Checkpoint passed</p>
        <h1>One step closer to certification</h1>

        <section className="certificate-progress-card">
          <div className="certificate-copy">
            <p>Selected course</p>
            <h2>Certificate progress: 58%</h2>
            <div className="certificate-progress-bar" aria-label="Certificate progress 58 percent">
              <span />
            </div>
            <p className="certificate-status">
              Completed: 3 of 6 modules Remaining: Modules 4-6 and final assessment
              Certificate unlocks automatically at 100%.
            </p>
            <button type="button">
              <ArrowRight size={16} />
              <span>Continue course</span>
            </button>
          </div>

          <button type="button" className="certificate-preview">
            <strong>base camp</strong>
            <span>Certificate of completion</span>
            <h2>Learner</h2>
            <p>Preview - Unlocks at course completion</p>
          </button>
        </section>
      </section>
    </main>
  );
}

