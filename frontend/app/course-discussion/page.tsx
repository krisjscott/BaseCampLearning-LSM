import {
  Award,
  BarChart3,
  BookOpen,
  Compass,
  Home,
  MessageCircle,
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
  ["48", "Posts"],
  ["12", "Unanswered"],
  ["6", "Following"],
] as const;

const conversations = [
  ["How detailed should a project scope be?", "8 replies", "Updated 12 min ago"],
  ["Examples of measurable deliverables", "5 replies", "Instructor answered"],
  ["Stakeholder mapping templates", "3 replies", "Resource attached"],
] as const;

export default function DiscussionForumDesktop() {
  return (
    <main className="certificate-detail-page course-discussion-page">
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
            <h1>Course Discussion</h1>
            <p>Ask questions and learn with your course community.</p>
          </div>
          <button type="button">
            <MessageCircle size={18} />
            <span>New post</span>
          </button>
        </header>

        <section className="certificate-detail-hero">
          <h2>Module 3 discussion</h2>
          <p>Share questions about scope, stakeholders and deliverables.</p>
          <button type="button">Join discussion -&gt;</button>
        </section>

        <section className="certificate-detail-stats" aria-label="Discussion summary">
          {stats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="share-certificate-title">Recent conversations</h2>

        <div className="certificate-detail-grid">
          <section className="certificate-share-list" aria-label="Recent conversations">
            {conversations.map(([title, replies, meta]) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>
                    {replies} - {meta}
                  </p>
                </div>
                <button type="button">Open -&gt;</button>
              </article>
            ))}
          </section>

          <aside className="verification-card">
            <h2>Community guidelines</h2>
            <p>Keep discussion useful, respectful and course-related.</p>
            <button type="button">Read guidelines -&gt;</button>
          </aside>
        </div>
      </section>
    </main>
  );
}

