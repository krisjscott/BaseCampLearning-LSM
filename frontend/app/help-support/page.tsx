import {
  Award,
  BarChart3,
  BookOpen,
  Compass,
  HelpCircle,
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
  ["24/7", "Help centre"],
  ["<24h", "Response target"],
  ["4", "Support topics"],
] as const;

const topics = [
  ["Course progress not updating", "Video and activity troubleshooting"],
  ["Quiz attempts and pass scores", "Assessment rules"],
  ["Download or verify a certificate", "Credential support"],
] as const;

export default function HelpSupportDesktop() {
  return (
    <main className="certificate-detail-page help-support-page">
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
            <strong>Nirjhar</strong>
            <span>Builder - 2,480 XP</span>
            <small>BC-CR-021</small>
          </section>
        </section>
      </aside>

      <section className="certificate-detail-main">
        <header className="certificate-detail-header">
          <div>
            <h1>Help &amp; Support</h1>
            <p>Find answers or contact the BaseCamp support team.</p>
          </div>
          <button type="button">
            <HelpCircle size={18} />
            <span>Contact support</span>
          </button>
        </header>

        <section className="certificate-detail-hero">
          <h2>How can we help?</h2>
          <p>Search help topics for courses, assessments, certificates and account access.</p>
          <button type="button">Search help centre -&gt;</button>
        </section>

        <section className="certificate-detail-stats" aria-label="Support summary">
          {stats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="share-certificate-title">Popular help topics</h2>

        <div className="certificate-detail-grid">
          <section className="certificate-share-list" aria-label="Popular help topics">
            {topics.map(([title, description]) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
                <button type="button">Open -&gt;</button>
              </article>
            ))}
          </section>

          <aside className="verification-card">
            <h2>System status</h2>
            <p>All BaseCamp services are operational.</p>
            <button type="button">View status -&gt;</button>
          </aside>
        </div>
      </section>
    </main>
  );
}

