import {
  Award,
  BarChart3,
  BookOpen,
  Compass,
  Home,
  Trophy,
} from "lucide-react";

const navItems = [
  ["Learning Home", Home, false],
  ["My Learning", BookOpen, true],
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
  ["0", "Active courses"],
  ["0", "Certificates"],
  ["Starter", "Current level"],
] as const;

const recommendations = [
  ["Course foundations", "Beginner", "Certificate path"],
  ["Completed course", "Beginner", "4 modules"],
  ["Available course", "Beginner", "5 modules"],
] as const;

export default function MyLearningEmptyStateDesktop() {
  return (
    <main className="certificate-detail-page my-learning-empty-page">
      <aside className="learning-sidebar">
        <img src="/basecamp-logo.png" alt="BaseCamp" className="learning-sidebar-logo" />

        <nav className="learning-nav" aria-label="Learning sections">
          {navItems.map(([label, Icon, active]) => (
            <a
              href={({
                "Learning Home": "/learning",
                "My Learning": "/my-learning",
                Explore: "/explore",
                Achievements: "/achievements",
                Certificates: "/certificates",
                Progress: "/progress",
              } as const)[label]}
              className={active ? "active" : ""}
              key={label}
            >
              <Icon size={22} strokeWidth={1.8} />
              <span>{label}</span>
            </a>
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
            <h1>My Learning</h1>
            <p>Your enrolled courses will appear here.</p>
          </div>
          <button type="button">
            <BookOpen size={18} />
            <span>Explore courses</span>
          </button>
        </header>

        <section className="certificate-detail-hero">
          <h2>Start your first learning path</h2>
          <p>Choose a course or accept an assignment to begin tracking progress.</p>
          <button type="button">Explore courses -&gt;</button>
        </section>

        <section className="certificate-detail-stats" aria-label="Empty learning summary">
          {stats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="share-certificate-title">Recommended starting points</h2>

        <div className="certificate-detail-grid">
          <section className="certificate-share-list" aria-label="Recommended starting points">
            {recommendations.map(([title, level, meta]) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>
                    {level} - {meta}
                  </p>
                </div>
                <button type="button">View -&gt;</button>
              </article>
            ))}
          </section>

          <aside className="verification-card">
            <h2>How enrolment works</h2>
            <p>Start a public course or receive an assigned course.</p>
            <button type="button">Learn more -&gt;</button>
          </aside>
        </div>
      </section>
    </main>
  );
}

