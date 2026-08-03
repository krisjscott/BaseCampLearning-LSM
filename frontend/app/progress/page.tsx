import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Compass,
  Home,
  Trophy,
} from "lucide-react";

const navItems = [
  ["Learning Home", Home, false],
  ["My Learning", BookOpen, false],
  ["Explore", Compass, false],
  ["Achievements", Trophy, false],
  ["Certificates", Award, false],
  ["Progress", BarChart3, true],
] as const;

const trails = [
  ["Project Management", "58%"],
  ["Content Writing", "24%"],
  ["Graphic Design", "8%"],
] as const;

const stats = [
  ["42h", "Learning time"],
  ["7", "Modules complete"],
  ["2 days", "Current streak"],
] as const;

const courseProgress = [
  ["Selected course", "58%", "On track"],
  ["Content Writing", "24%", "1h this week"],
  ["Graphic Design", "8%", "Needs attention"],
] as const;

export default function ProgressDashboard() {
  return (
    <main className="progress-dashboard-page">
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

      <section className="progress-dashboard-main">
        <header className="progress-dashboard-header">
          <div>
            <h1>Progress</h1>
            <p>Learning time, course completion and skill growth.</p>
          </div>
          <button type="button">
            <BarChart3 size={18} />
            <span>Export report</span>
          </button>
        </header>

        <section className="progress-dashboard-hero">
          <h2>You are building momentum</h2>
          <p>Complete two more weekly goals to maintain your Builder pace.</p>
          <button type="button">View insights -&gt;</button>
        </section>

        <section className="progress-dashboard-stats" aria-label="Progress summary">
          {stats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="progress-by-course-title">Progress by course</h2>

        <div className="progress-dashboard-grid">
          <section className="course-progress-list" aria-label="Progress by course">
            {courseProgress.map(([title, percent, status]) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>
                    {percent} - {status}
                  </p>
                </div>
                <button type="button">Details -&gt;</button>
              </article>
            ))}
          </section>

          <aside className="current-level-card">
            <div className="current-level-card-header">
              <section>
                <p>Current level</p>
                <h2>Builder</h2>
              </section>
            </div>
            <div className="current-level-xp">
              <strong>2,830</strong>
              <span>/ 4,000 XP</span>
            </div>
            <div className="current-level-meter" aria-label="2,830 of 4,000 XP toward Achiever">
              <span />
            </div>
            <div className="current-level-next">
              <span>Next stage</span>
              <strong>Achiever</strong>
            </div>
            <div className="current-level-pill-row" aria-label="Level milestones">
              <span>Starter</span>
              <span className="active">Builder</span>
              <span>Achiever</span>
            </div>
            <button type="button">
              <span>Level details</span>
              <ArrowRight size={17} strokeWidth={2.3} />
            </button>
          </aside>
        </div>
      </section>
    </main>
  );
}

