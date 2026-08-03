import {
  Award,
  BarChart3,
  BookOpen,
  Check,
  Compass,
  Home,
  LockKeyhole,
  Trophy,
} from "lucide-react";

const navItems = [
  ["Learning Home", Home, false],
  ["My Learning", BookOpen, false],
  ["Explore", Compass, false],
  ["Achievements", Trophy, true],
  ["Certificates", Award, false],
  ["Progress", BarChart3, false],
] as const;

const trails = [
  ["Project Management", "58%"],
  ["Content Writing", "24%"],
  ["Graphic Design", "8%"],
] as const;

const stats = [
  ["12", "Badges"],
  ["2,830", "Total XP"],
  ["Builder", "Current level"],
] as const;

const recentAchievements = [
  ["Checkpoint Pro", "Passed 5 required quizzes"],
  ["Two-Day Streak", "Learned on consecutive days"],
  ["Design Explorer", "Started a design pathway"],
] as const;

const levelLadder = [
  { level: "Starter", xp: "0 XP", state: "done", label: "Completed" },
  { level: "Builder", xp: "0 XP", state: "current", label: "You are here" },
  { level: "Achiever", xp: "4,000 XP", state: "next", label: "Next stage" },
  { level: "Champion", xp: "7,500 XP", state: "locked", label: "Final stage" },
] as const;

export default function Achievements() {
  return (
    <main className="achievements-page">
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

      <section className="achievements-main">
        <header className="achievements-header">
          <div>
            <h1>Achievements</h1>
            <p>Milestones, levels, badges and streaks.</p>
          </div>
          <button type="button">
            <Trophy size={18} />
            <span>Share profile</span>
          </button>
        </header>

        <section className="achievements-hero">
          <h2>Next level: Achiever</h2>
          <p>Earn 1,170 more XP through courses, quizzes and certificates.</p>
          <button type="button">View level path -&gt;</button>
        </section>

        <section className="achievements-stats" aria-label="Achievements summary">
          {stats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="recent-achievements-title">Recent achievements</h2>

        <div className="achievements-grid">
          <section className="achievement-list" aria-label="Recent achievements">
            {recentAchievements.map(([title, detail]) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </div>
                <button type="button">Share -&gt;</button>
              </article>
            ))}
          </section>

          <aside className="level-ladder-card">
            <h2>Level ladder</h2>
            <div className="level-ladder-steps" aria-label="Starter to Champion level ladder">
              {levelLadder.map(({ level, xp, state, label }, index) => (
                <div className={`ladder-step ${state}`} key={level}>
                  <span className="ladder-step-number">
                    {state === "done" ? <Check size={15} strokeWidth={2.7} /> : state === "locked" ? <LockKeyhole size={14} strokeWidth={2.3} /> : index + 1}
                  </span>
                  <section className="ladder-step-copy">
                    <span>{label}</span>
                    <strong>{level}</strong>
                    <small>{xp}</small>
                  </section>
                </div>
              ))}
            </div>
            <button type="button">View rules -&gt;</button>
          </aside>
        </div>
      </section>
    </main>
  );
}

