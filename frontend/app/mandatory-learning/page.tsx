import {
  Award,
  BarChart3,
  BookOpen,
  ClipboardCheck,
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
  ["Progress", BarChart3, false],
] as const;

const trails = [
  ["Project Management", "58%"],
  ["Content Writing", "24%"],
  ["Graphic Design", "8%"],
] as const;

const stats = [
  ["3", "Required"],
  ["1", "Due this week"],
  ["67%", "Completed"],
] as const;

const assignedTraining = [
  ["Data Protection Basics", "Due Aug 05", "Not started", "Start"],
  ["Code of Conduct", "Completed Jul 14", "", "Review"],
  ["Client Confidentiality", "Due Aug 12", "30%", "Continue"],
] as const;

export default function MandatoryLearning() {
  return (
    <main className="mandatory-page">
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

      <section className="mandatory-main">
        <header className="mandatory-header">
          <div>
            <h1>Mandatory Learning</h1>
            <p>Required courses assigned to your account.</p>
          </div>
          <button type="button">
            <ClipboardCheck size={18} />
            <span>View policy</span>
          </button>
        </header>

        <section className="mandatory-hero">
          <h2>Workplace Safety Essentials</h2>
          <p>Required video and quiz - Due Jul 30 - Estimated 35 minutes.</p>
          <button type="button">Continue required course -&gt;</button>
        </section>

        <section className="mandatory-stats" aria-label="Mandatory learning summary">
          {stats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="assigned-training-title">Assigned training</h2>

        <div className="mandatory-content-grid">
          <section className="assigned-training-list" aria-label="Assigned training">
            {assignedTraining.map(([title, due, status, action]) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>{status ? `${due} - ${status}` : due}</p>
                </div>
                <button type="button">{action} -&gt;</button>
              </article>
            ))}
          </section>

          <aside className="compliance-status-card">
            <h2>Compliance status</h2>
            <p>All current assignments are on track.</p>
            <button type="button">See deadlines -&gt;</button>
          </aside>
        </div>
      </section>
    </main>
  );
}


