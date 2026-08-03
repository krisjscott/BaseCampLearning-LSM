import {
  Award,
  BadgeCheck,
  BarChart3,
  BookOpen,
  CalendarDays,
  Compass,
  Copy,
  Download,
  ExternalLink,
  Home,
  ImageDown,
  KeyRound,
  Link,
  Share2,
  ShieldCheck,
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
  ["Jul 20", "Issue date", CalendarDays],
  ["No expiry", "Validity", ShieldCheck],
  ["BC-CW-0148", "Credential ID", KeyRound],
] as const;

const shareOptions = [
  ["LinkedIn", "Add to licenses and certifications", "Share", BadgeCheck, Share2],
  ["Public verification link", "Copy credential URL", "Copy", Link, Copy],
  ["Certificate image", "Download share card", "Download", ImageDown, Download],
] as const;

export default function CertificateDetailShareDesktop() {
  return (
    <main className="certificate-detail-page">
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

      <section className="certificate-detail-main">
        <header className="certificate-detail-header">
          <div>
            <h1>Certificate Detail</h1>
            <p>A verified record of completed learning.</p>
          </div>
          <button type="button">
            <Download size={18} />
            <span>Download PDF</span>
          </button>
        </header>

        <section className="certificate-detail-hero">
          <BadgeCheck size={28} />
          <h2>Certified in Completed course</h2>
          <p>Awarded to Learner after completing all required modules and assessments.</p>
          <button type="button">Verify credential -&gt;</button>
        </section>

        <section className="certificate-detail-stats" aria-label="Credential summary">
          {stats.map(([value, label, Icon]) => (
            <article key={label}>
              <Icon size={18} />
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="share-certificate-title">Share certificate</h2>

        <div className="certificate-detail-grid">
          <section className="certificate-share-list" aria-label="Share certificate">
            {shareOptions.map(([title, description, action, Icon, ActionIcon]) => (
              <article key={title}>
                <div className="list-row-copy">
                  <Icon size={18} />
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                </div>
                <button type="button">
                  <ActionIcon size={15} />
                  <span>{action} -&gt;</span>
                </button>
              </article>
            ))}
          </section>

          <aside className="verification-card">
            <h2>Verification</h2>
            <p>Credential status: Active and verified.</p>
            <button type="button">
              <ExternalLink size={15} />
              <span>Open public record -&gt;</span>
            </button>
          </aside>
        </div>
      </section>
    </main>
  );
}

