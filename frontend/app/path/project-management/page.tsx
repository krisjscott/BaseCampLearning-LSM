import {
  Award,
  BarChart3,
  BookOpen,
  Compass,
  Home,
  PlayCircle,
  Trophy,
} from "lucide-react";

const navItems = [
  ["Learning Home", Home, false],
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
  ["4", "Courses"],
  ["48h", "Estimated"],
  ["1", "Certificate"],
] as const;

const curriculum = [
  ["1. Project Management Foundations", "Starter", "Start here", "Begin"],
  ["2. Planning & Execution", "Builder", "Locked", "Requirements"],
  ["3. Leading Delivery", "Achiever", "Locked", "Requirements"],
] as const;

export default function ProjectManagementPath() {
  return (
    <main className="path-page">
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

      <section className="path-main">
        <header className="path-header">
          <div>
            <h1>Project Management Path</h1>
            <p>A structured route from Starter to Champion.</p>
          </div>
          <button type="button">
            <PlayCircle size={18} />
            <span>Start path</span>
          </button>
        </header>

        <section className="path-hero">
          <h2>Starter -&gt; Builder -&gt; Achiever -&gt; Champion</h2>
          <p>Complete four progressive courses, required quizzes and practical checkpoints.</p>
          <button type="button">View full path -&gt;</button>
        </section>

        <section className="path-stats" aria-label="Path summary">
          {stats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="path-curriculum-title">Path curriculum</h2>

        <div className="path-content-grid">
          <section className="path-curriculum-list" aria-label="Path curriculum">
            {curriculum.map(([title, level, state, action]) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>
                    {level} - {state}
                  </p>
                </div>
                <button type="button">{action} -&gt;</button>
              </article>
            ))}
          </section>

          <aside className="path-progress-card">
            <h2>Path progress</h2>
            <p>0 of 4 courses completed.</p>
            <button type="button">View requirements -&gt;</button>
          </aside>
        </div>
      </section>
    </main>
  );
}

