import {
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
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
  ["4", "Upcoming"],
  ["2", "Assessments"],
  ["1", "Due this week"],
] as const;

const scheduleItems = [
  ["Jul 30", "Workplace Safety", "Required course deadline", "Open"],
  ["Aug 02", "Communication Mastery", "Course begins", "View"],
  ["Aug 05", "Data Protection", "Required course deadline", "Open"],
] as const;

export default function LearningCalendar() {
  return (
    <main className="calendar-page">
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

      <section className="calendar-main">
        <header className="calendar-header">
          <div>
            <h1>Learning Calendar</h1>
            <p>Checkpoints, deadlines and scheduled learning.</p>
          </div>
          <button type="button">
            <CalendarDays size={18} />
            <span>Add reminder</span>
          </button>
        </header>

        <section className="calendar-hero">
          <h2>Next checkpoint - Jul 28</h2>
          <p>Scope and Deliverables Quiz - Selected course</p>
          <button type="button">Open checkpoint -&gt;</button>
        </section>

        <section className="calendar-stats" aria-label="Calendar summary">
          {stats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="schedule-title">Schedule</h2>

        <div className="calendar-content-grid">
          <section className="schedule-list" aria-label="Learning schedule">
            {scheduleItems.map(([date, title, detail, action]) => (
              <article key={`${date}-${title}`}>
                <div>
                  <h3>
                    {date} - {title}
                  </h3>
                  <p>{detail}</p>
                </div>
                <button type="button">{action} -&gt;</button>
              </article>
            ))}
          </section>

          <aside className="calendar-sync-card">
            <h2>Calendar sync</h2>
            <p>Add learning dates to your preferred calendar.</p>
            <button type="button">Connect calendar -&gt;</button>
          </aside>
        </div>
      </section>
    </main>
  );
}

