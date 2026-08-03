import {
  Award,
  BarChart3,
  Bookmark,
  BookOpen,
  Compass,
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
  ["8", "Notes"],
  ["4", "Bookmarks"],
  ["3", "Resources"],
] as const;

const savedItems = [
  ["Define scope clearly", "Video 07:18", "Module 3 Lesson 4"],
  ["Stakeholder influence matrix", "Reading", "Module 3 Lesson 2"],
  ["Project charter template", "Resource", "Downloaded Jul 24"],
] as const;

export default function NotesBookmarksDesktop() {
  return (
    <main className="certificate-detail-page notes-bookmarks-page">
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
            <h1>Notes &amp; Bookmarks</h1>
            <p>Review saved moments, lesson notes and resources.</p>
          </div>
          <button type="button">
            <Bookmark size={18} />
            <span>Create note</span>
          </button>
        </header>

        <section className="certificate-detail-hero">
          <h2>12 saved learning moments</h2>
          <p>Notes remain linked to the exact lesson and video timestamp.</p>
          <button type="button">Open saved items -&gt;</button>
        </section>

        <section className="certificate-detail-stats" aria-label="Saved learning summary">
          {stats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="share-certificate-title">Recently saved</h2>

        <div className="certificate-detail-grid">
          <section className="certificate-share-list" aria-label="Recently saved">
            {savedItems.map(([title, type, meta]) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>
                    {type} - {meta}
                  </p>
                </div>
                <button type="button">Open -&gt;</button>
              </article>
            ))}
          </section>

          <aside className="verification-card">
            <h2>Export notes</h2>
            <p>Download your course notes as a document.</p>
            <button type="button">Export -&gt;</button>
          </aside>
        </div>
      </section>
    </main>
  );
}

