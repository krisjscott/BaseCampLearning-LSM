import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Check,
  Compass,
  Grid2X2,
  GraduationCap,
  Home,
  List,
  Lock,
  MessageCircle,
  Share2,
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

const modules = [
  ["Foundations of project management", "Completed - Jul 12", "Review", "done"],
  ["Starting a successful project", "Completed - Jul 19", "Review", "done"],
  ["Planning and execution", "4 of 7 lessons - In progress", "Continue ->", "current"],
  ["Project execution and delivery", "Locked until Module 3 is complete", "Locked", "locked"],
] as const;

const skills = ["Project planning", "Stakeholder communication", "Risk management", "Agile delivery"] as const;

function Sidebar() {
  return (
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
  );
}

export default function CourseOverview() {
  return (
    <main className="course-overview">
      <Sidebar />

      <section className="course-main">
        <header className="course-breadcrumb">
          <p>My Learning / Google Project Management</p>
          <div>
            <button type="button"><Share2 size={16} /><span>Share</span></button>
          </div>
        </header>

        <section className="course-hero">
          <div className="course-hero-copy">
            <p>BaseCamp certificate</p>
            <h1>Google Project Management</h1>
            <span>Build practical project management skills through guided lessons, real workplace scenarios and assessed checkpoints.</span>
            <div className="course-facts">
              <span>6 modules</span>
              <span>Beginner</span>
              <span>Approx. 24 hours</span>
              <span>Certificate</span>
            </div>
          </div>

          <aside className="course-progress-card">
            <p>Your progress</p>
            <h2>58% complete</h2>
            <div aria-label="58 percent complete">
              <span />
            </div>
            <span>Next: Define scope &amp; deliverables</span>
            <button type="button"><span>Continue learning</span><ArrowRight size={16} /></button>
          </aside>
        </section>

        <nav className="course-tabs" aria-label="Course sections">
          <button type="button">
            <Grid2X2 size={16} />
            <span>Overview</span>
          </button>
          <button type="button" className="active">
            <List size={16} />
            <span>Course content</span>
          </button>
          <button type="button">
            <GraduationCap size={16} />
            <span>Grades</span>
          </button>
          <button type="button">
            <MessageCircle size={16} />
            <span>Discussion</span>
          </button>
        </nav>

        <div className="course-content-grid">
          <section className="module-panel">
            <h2>Course content</h2>
            <p>6 modules - 28 lessons - 7 quizzes</p>

            <div className="module-list">
              {modules.map(([title, meta, action, state], index) => (
                <article className="module-row" key={title}>
                  <div className={`module-status ${state}`}>
                    {state === "done" && <Check size={18} />}
                    {state === "current" && <span>{String(index + 1).padStart(2, "0")}</span>}
                    {state === "locked" && <Lock size={17} />}
                  </div>
                  <section>
                    <h3>{title}</h3>
                    <p>{meta}</p>
                  </section>
                  <button type="button" className={state === "current" ? "continue" : ""}>
                    {action}
                  </button>
                </article>
              ))}
            </div>
          </section>

          <aside className="course-side-panel">
            <section className="info-card muted">
              <h2>Skills you will gain</h2>
              <div className="skill-chip-list" aria-label="Skills you will gain">
                {skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </section>
            <section className="info-card">
              <h2>Earn a verified certificate</h2>
              <p>Complete all lessons and required quizzes to unlock a downloadable, shareable certificate.</p>
              <button type="button"><Award size={16} /><span>View certificate requirements -&gt;</span></button>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}



