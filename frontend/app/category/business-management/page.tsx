import {
  Award,
  BarChart3,
  BookOpen,
  Compass,
  Home,
  ListFilter,
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
  ["14", "Courses"],
  ["4", "Learning paths"],
  ["3", "Skill levels"],
] as const;

const featuredCourses = [
  ["Selected course", "Certificate", "6 modules"],
  ["Business Operations Essentials", "Course", "4 modules"],
  ["Leadership Foundations", "Course", "5 modules"],
] as const;

export default function BusinessManagementCategory() {
  return (
    <main className="category-page">
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

      <section className="category-main">
        <header className="category-header">
          <div>
            <h1>Business &amp; Management</h1>
            <p>Courses for planning, operations, leadership and delivery.</p>
          </div>
          <button type="button">
            <ListFilter size={18} />
            <span>Sort courses</span>
          </button>
        </header>

        <section className="category-hero">
          <h2>Project management learning collection</h2>
          <p>Progress from foundational planning to advanced delivery leadership.</p>
          <button type="button">Explore collection -&gt;</button>
        </section>

        <section className="category-stats" aria-label="Category summary">
          {stats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="featured-category-title">Featured in this category</h2>

        <div className="category-content-grid">
          <section className="featured-category-list" aria-label="Featured courses">
            {featuredCourses.map(([title, type, modules]) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>
                    {type} - {modules}
                  </p>
                </div>
                <button type="button">View -&gt;</button>
              </article>
            ))}
          </section>

          <aside className="category-skills-card">
            <h2>Category skills</h2>
            <p>Planning - Operations - Leadership - Communication</p>
            <button type="button">Follow category -&gt;</button>
          </aside>
        </div>
      </section>
    </main>
  );
}

