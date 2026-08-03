import {
  Award,
  BarChart3,
  BookOpen,
  Compass,
  Home,
  Trophy,
  Upload,
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
  ["100", "Points"],
  ["Aug 08", "Due date"],
  ["Draft", "Status"],
] as const;

const requirements = [
  ["Scope statement", <>Required - 300-500 words</>, "Add response"],
  ["Deliverables list", <>Required - Minimum 4 items</>, "Add response"],
  ["Supporting document", <>PDF or DOCX - Maximum 10 MB</>, "Upload"],
] as const;

export default function AssignmentSubmissionDesktop() {
  return (
    <main className="certificate-detail-page assignment-submission-page">
      <aside className="learning-sidebar">
        <img src="/basecamp-logo.png" alt="BaseCamp" className="learning-sidebar-logo" />

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
            <strong>Learner</strong>
            <span>Learner</span>
            <small>Account active</small>
          </section>
        </section>
      </aside>

      <section className="certificate-detail-main">
        <header className="certificate-detail-header">
          <div>
            <h1>Practical Assignment</h1>
            <p>Apply Module 3 skills to a workplace scenario.</p>
          </div>
          <button type="button">
            <Upload size={18} />
            <span>Save draft</span>
          </button>
        </header>

        <section className="certificate-detail-hero">
          <h2>Create a project scope statement</h2>
          <p>Upload your response and supporting file before Aug 08.</p>
          <button type="button">Open assignment -&gt;</button>
        </section>

        <section className="certificate-detail-stats" aria-label="Assignment summary">
          {stats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="share-certificate-title">Submission requirements</h2>

        <div className="certificate-detail-grid">
          <section className="certificate-share-list" aria-label="Submission requirements">
            {requirements.map(([title, description, action]) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
                <button type="button">{action} -&gt;</button>
              </article>
            ))}
          </section>

          <aside className="verification-card">
            <h2>Assessment rubric</h2>
            <p>Clarity 40% - Completeness 35% - Practicality 25%</p>
            <button type="button">View rubric -&gt;</button>
          </aside>
        </div>
      </section>
    </main>
  );
}

