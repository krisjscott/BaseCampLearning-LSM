import {
  Award,
  BarChart3,
  BookOpen,
  Compass,
  Home,
  RefreshCw,
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
  ["Email", "Supported"],
  ["Crew ID", "Supported"],
  ["Secure", "Recovery"],
] as const;

const recoveryOptions = [
  ["Email address", "Receive a secure sign-in link", "Use email"],
  ["Crew ID", "Verify identity and reset access", "Use Crew ID"],
  ["Google sign-in", "Return to Google authentication", "Continue"],
] as const;

export default function AccessRecoveryDesktop() {
  return (
    <main className="certificate-detail-page recover-access-page">
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

      <section className="certificate-detail-main">
        <header className="certificate-detail-header">
          <div>
            <h1>Recover Access</h1>
            <p>Restore access using your email address or Crew ID.</p>
          </div>
          <button type="button">
            <RefreshCw size={18} />
            <span>Send recovery link</span>
          </button>
        </header>

        <section className="certificate-detail-hero">
          <h2>Email or Crew ID recovery</h2>
          <p>Enter the identifier used for BaseCamp. We will send the next secure step.</p>
          <button type="button">Begin recovery -&gt;</button>
        </section>

        <section className="certificate-detail-stats" aria-label="Recovery summary">
          {stats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="share-certificate-title">Recovery options</h2>

        <div className="certificate-detail-grid">
          <section className="certificate-share-list" aria-label="Recovery options">
            {recoveryOptions.map(([title, description, action]) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
                <button type="button">{action} -&gt;</button>
              </article>
            ))}
          </section>

          <aside className="verification-card">
            <h2>Need help?</h2>
            <p>Contact support if you no longer have access to your email.</p>
            <button type="button">Contact support -&gt;</button>
          </aside>
        </div>
      </section>
    </main>
  );
}

