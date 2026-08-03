import {
  Award,
  BadgeCheck,
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
  ["Certificates", Award, true],
  ["Progress", BarChart3, false],
] as const;

const trails = [
  ["Project Management", "58%"],
  ["Content Writing", "24%"],
  ["Graphic Design", "8%"],
] as const;

const stats = [
  ["Active", "Status"],
  ["No expiry", "Validity"],
  ["BC-CW-0148", "Credential ID"],
] as const;

const records = [
  ["Learner", "Learner"],
  ["Course", "Completed course"],
  ["Issuer", "BaseCamp - TIES HQ"],
] as const;

export default function PublicCredentialVerificationDesktop() {
  return (
    <main className="certificate-detail-page verify-credential-page">
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
            <h1>Verify Credential</h1>
            <p>Confirm a BaseCamp certificate and its current status.</p>
          </div>
          <button type="button">
            <BadgeCheck size={18} />
            <span>Copy verification link</span>
          </button>
        </header>

        <section className="certificate-detail-hero">
          <h2>Verified certificate</h2>
          <p>Completed course - Awarded to Learner - Issued Jul 20, 2026.</p>
          <button type="button">View certificate -&gt;</button>
        </section>

        <section className="certificate-detail-stats" aria-label="Credential verification summary">
          {stats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="share-certificate-title">Credential record</h2>

        <div className="certificate-detail-grid">
          <section className="certificate-share-list" aria-label="Credential record">
            {records.map(([title, description]) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
                <button type="button">Confirmed -&gt;</button>
              </article>
            ))}
          </section>

          <aside className="verification-card">
            <h2>Verification integrity</h2>
            <p>This public record is generated directly from BaseCamp.</p>
            <button type="button">Report issue -&gt;</button>
          </aside>
        </div>
      </section>
    </main>
  );
}


