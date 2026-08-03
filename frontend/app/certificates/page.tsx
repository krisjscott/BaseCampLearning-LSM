"use client";

import {
  Award,
  BarChart3,
  BookOpen,
  Compass,
  Home,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CertificateResponse, UserResponse, getCertificates, getCurrentUser } from "../lib/backendApi";
import AuthGuard from "../components/AuthGuard";
import { CardSkeleton, SidebarSkeleton } from "../components/Skeleton";

const navItems = [
  ["Learning Home", Home, false],
  ["My Learning", BookOpen, false],
  ["Explore", Compass, false],
  ["Achievements", Trophy, false],
  ["Certificates", Award, true],
  ["Progress", BarChart3, false],
] as const;

function shortDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function longDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function CertificatesWallet() {
  const [backendCertificates, setBackendCertificates] = useState<CertificateResponse[]>([]);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getCertificates(), getCurrentUser()])
      .then(([certificatesResult, userResult]) => {
        if (!active) return;
        if (certificatesResult.status === "fulfilled") {
          setBackendCertificates(certificatesResult.value);
        }
        if (userResult.status === "fulfilled" && userResult.value) {
          setUser(userResult.value);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const credentialRows = useMemo(() => {
    return backendCertificates.slice(0, 3).map((certificate) => [
      certificate.title || certificate.courseName || "Certificate",
      certificate.issuedDate ? `Issued ${shortDate(certificate.issuedDate)}` : "Issued",
      certificate.certificateNumber ? "Verified" : "",
      certificate.fileUrl ? "Download" : "Open",
    ] as const);
  }, [backendCertificates]);

  const summaryStats = useMemo(() => {
    return [
      [String(backendCertificates.length), "Ready"],
      ["0", "In progress"],
      ["0", "Expiring"],
    ] as const;
  }, [backendCertificates]);

  const heroCertificate = backendCertificates[0];
  const learnerName = user?.fullName?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <main className="certificates-page">
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
          {loading ? <SidebarSkeleton /> : <small>No course progress yet</small>}
        </section>
        <section className="learner-profile" aria-label="Learner profile">
          <div>{learnerName.charAt(0).toUpperCase()}</div>
          <section>
            <strong>{learnerName}</strong>
            <span>{user?.role || "Learner"}</span>
            <small>{user?.email || "Account active"}</small>
          </section>
        </section>
      </aside>

      <section className="certificates-main">
        <header className="certificates-header">
          <div>
            <h1>Certificates</h1>
            <p>Download, verify and share completed credentials.</p>
          </div>
          <button type="button">
            <Award size={18} />
            <span>Verify credential</span>
          </button>
        </header>

        <section className="certificates-hero">
          {loading ? <CardSkeleton lines={3} /> : (
            <>
              <h2>{heroCertificate?.title || "No certificates yet"}</h2>
              <p>
                {heroCertificate?.issuedDate ? `Certificate issued ${longDate(heroCertificate.issuedDate)}` : "Completed course certificates will appear here."}{" "}
                {heroCertificate?.certificateNumber ? `- Credential ${heroCertificate.certificateNumber}` : ""}
              </p>
              <button type="button">{heroCertificate ? "Download certificate ->" : "Explore courses ->"}</button>
            </>
          )}
        </section>

        <section className="certificates-stats" aria-label="Certificates summary">
          {loading ? Array.from({ length: 3 }, (_, index) => (
            <article key={index}>
              <CardSkeleton lines={2} />
            </article>
          )) : summaryStats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="credentials-title">Your credentials</h2>

        <div className="certificates-grid">
          <section className="credential-list" aria-label="Your credentials">
            {loading ? Array.from({ length: 3 }, (_, index) => (
              <CardSkeleton key={index} lines={2} />
            )) : credentialRows.length ? credentialRows.map(([title, meta, status, action]) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>{status ? `${meta} - ${status}` : meta}</p>
                </div>
                <button type="button">{action} -&gt;</button>
              </article>
            )) : (
              <article>
                <div>
                  <h3>No credentials issued</h3>
                  <p>Certificates are created from completed course assessments.</p>
                </div>
                <button type="button">Explore courses -&gt;</button>
              </article>
            )}
          </section>

          <aside className="public-profile-card">
            {loading ? <CardSkeleton lines={5} /> : (
              <>
                <div className="side-card-kicker">Public profile</div>
                <h2>{backendCertificates.length} credentials visible</h2>
                <p>Only certificates stored in the database appear on your profile.</p>
                <div className="profile-visibility-list" aria-label="Public profile visibility">
                  <span>
                    <strong>{backendCertificates[0]?.courseName || "No public certificates"}</strong>
                    <small>{backendCertificates.length ? "Visible" : "Hidden"}</small>
                  </span>
                </div>
                <button type="button">Manage visibility -&gt;</button>
              </>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

export default function CertificatesPage() {
  return (
    <AuthGuard>
      <CertificatesWallet />
    </AuthGuard>
  );
}
