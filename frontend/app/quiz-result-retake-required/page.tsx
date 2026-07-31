import {
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  ClipboardList,
  Compass,
  Home,
  ListChecks,
  Percent,
  RotateCcw,
  Trophy,
} from "lucide-react";

const navItems = [
  ["Learning Home", Home, true],
  ["My Learning", BookOpen, false],
  ["Explore", Compass, false],
  ["Achievements", Trophy, false],
  ["Certificates", Award, false],
  ["Progress", BarChart3, false],
] as const;

const trails = [
  ["Project Management", "58%"],
  ["Content Writing", "24%"],
  ["Graphic Design", "8%"],
] as const;

const stats = [
  ["67%", "Score", Percent],
  ["1 of 2", "Attempts used", RotateCcw],
  ["4", "Review topics", ListChecks],
] as const;

const reviewTopics = [
  ["Project deliverables", "2 questions incorrect", ClipboardList],
  ["Scope boundaries", "1 question incorrect", ClipboardList],
  ["Stakeholder roles", "1 question incorrect", ClipboardList],
] as const;

export default function QuizResultRetakeRequiredDesktop() {
  return (
    <main className="certificate-detail-page quiz-result-retake-required-page">
      <aside className="learning-sidebar">
        <img src="/BasecampLogoExact.png" alt="BaseCamp" className="learning-sidebar-logo" />

        <nav className="learning-nav" aria-label="Learning sections">
          {navItems.map(([label, Icon, active]) => (
            <button type="button" className={active ? "active" : ""} key={label}>
              <Icon size={22} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <section className="recent-trails" aria-label="Recent trails">
          <p>Recent trails</p>
          {trails.map(([name, progress]) => (
            <div key={name}>
              <span>{name}</span>
              <strong>{progress}</strong>
            </div>
          ))}
        </section>
<section className="learner-profile" aria-label="Learner profile">
          <div>N</div>
          <section>
            <strong>Nirjhar</strong>
            <span>Builder - 2,480 XP</span>
            <small>BC-CR-021</small>
          </section>
        </section>
      </aside>

      <section className="certificate-detail-main">
        <header className="certificate-detail-header">
          <div>
            <h1>Assessment result</h1>
            <p>Your attempt was recorded, but the pass score was not reached.</p>
          </div>
          <button type="button">
            <RotateCcw size={18} />
            <span>Start retake</span>
          </button>
        </header>

        <section className="certificate-detail-hero">
          <AlertTriangle size={28} />
          <h2>Score: 67% - Pass score: 80%</h2>
          <p>8 of 12 correct - Attempt 1 of 2 - Completed Jul 26, 2026.</p>
          <button type="button">
            <ClipboardList size={15} />
            <span>Review attempt -&gt;</span>
          </button>
        </section>

        <section className="certificate-detail-stats" aria-label="Assessment result summary">
          {stats.map(([value, label, Icon]) => (
            <article key={label}>
              <Icon size={18} />
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="share-certificate-title">Review before retaking</h2>

        <div className="certificate-detail-grid">
          <section className="certificate-share-list" aria-label="Review topics">
            {reviewTopics.map(([title, description, Icon]) => (
              <article key={title}>
                <div className="list-row-copy">
                  <Icon size={18} />
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                </div>
                <button type="button">
                  <BookOpenCheck size={15} />
                  <span>Review -&gt;</span>
                </button>
              </article>
            ))}
          </section>

          <aside className="verification-card">
            <h2>Retake rule</h2>
            <p>The second attempt uses a new question order.</p>
            <button type="button">
              <ListChecks size={15} />
              <span>View rules -&gt;</span>
            </button>
          </aside>
        </div>
      </section>
    </main>
  );
}

