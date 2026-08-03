import {
  Award,
  BarChart3,
  BookOpen,
  Compass,
  FileText,
  Home,
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
  ["8 min", "Estimated"],
  ["5 of 7", "Lesson"],
  ["Auto", "Progress saved"],
] as const;

const lessonSections = [
  ["1. Break work into outcomes", "Core concept", "3 min"],
  ["2. Define work packages", "Examples", "3 min"],
  ["3. Check completeness", "Summary", "2 min"],
] as const;

export default function ReadingLessonDesktop() {
  return (
    <main className="certificate-detail-page reading-lesson-page">
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
            <h1>Reading Lesson</h1>
            <p>Module 3 - Lesson 5 of 7.</p>
          </div>
          <button type="button">
            <FileText size={18} />
            <span>Mark complete</span>
          </button>
        </header>

        <section className="certificate-detail-hero">
          <h2>Build a work breakdown structure</h2>
          <p>Estimated reading time: 8 minutes - Required before the checkpoint.</p>
          <button type="button">Continue reading -&gt;</button>
        </section>

        <section className="certificate-detail-stats" aria-label="Reading lesson summary">
          {stats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="share-certificate-title">Lesson sections</h2>

        <div className="certificate-detail-grid">
          <section className="certificate-share-list" aria-label="Lesson sections">
            {lessonSections.map(([title, type, duration]) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>
                    {type} - {duration}
                  </p>
                </div>
                <button type="button">Read -&gt;</button>
              </article>
            ))}
          </section>

          <aside className="verification-card">
            <h2>Lesson requirement</h2>
            <p>Scroll through all sections to mark this reading complete.</p>
            <button type="button">View progress -&gt;</button>
          </aside>
        </div>
      </section>
    </main>
  );
}

