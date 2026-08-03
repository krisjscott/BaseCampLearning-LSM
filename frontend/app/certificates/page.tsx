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
  ["1", "Ready"],
  ["2", "In progress"],
  ["0", "Expiring"],
] as const;

const credentials = [
  ["Content Writing Foundations", "Issued Jul 20", "Verified", "Open"],
  ["Google Project Management", "58% complete", "", "Progress"],
  ["Graphic Design Essentials", "8% complete", "", "Progress"],
] as const;

function shortDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function longDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export default function CertificatesWallet() {
  const [backendCertificates, setBackendCertificates] = useState<CertificateResponse[]>([]);
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getCertificates(), getCurrentUser()])
      .then(([certificatesResult, userResult]) => {
        if (!active) return;
        if (certificatesResult.status === "fulfilled" && certificatesResult.value.length) {
          setBackendCertificates(certificatesResult.value);
        }
        if (userResult.status === "fulfilled" && userResult.value) {
          setUser(userResult.value);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const credentialRows = useMemo(() => {
    if (!backendCertificates.length) return credentials;
    return backendCertificates.slice(0, 3).map((certificate) => [
      certificate.title || certificate.courseName || "Certificate",
      certificate.issuedDate ? `Issued ${shortDate(certificate.issuedDate)}` : "Issued",
      certificate.certificateNumber ? "Verified" : "",
      certificate.fileUrl ? "Download" : "Open",
    ] as const);
  }, [backendCertificates]);

  const summaryStats = useMemo(() => {
    if (!backendCertificates.length) return stats;
    return [
      [String(backendCertificates.length), "Ready"],
      ["0", "In progress"],
      ["0", "Expiring"],
    ] as const;
  }, [backendCertificates]);

  const heroCertificate = backendCertificates[0];
  const learnerName = user?.fullName?.split(" ")[0] || user?.email?.split("@")[0] || "Nirjhar";

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
          {trails.map(([name, progress]) => (
            <div key={name}>
              <span>{name}</span>
              <strong>{progress}</strong>
            </div>
          ))}
        </section>
        <section className="learner-profile" aria-label="Learner profile">
          <div>{learnerName.charAt(0).toUpperCase()}</div>
          <section>
            <strong>{learnerName}</strong>
            <span>Builder - 2,480 XP</span>
            <small>BC-CR-021</small>
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
          <h2>{heroCertificate?.title || "Content Writing Foundations"}</h2>
          <p>
            {heroCertificate?.issuedDate ? `Certificate issued ${longDate(heroCertificate.issuedDate)}` : "Certificate issued Jul 20, 2026"}{" "}
            - Credential {heroCertificate?.certificateNumber || "BC-CW-0148"}
          </p>
          <button type="button">Download certificate -&gt;</button>
        </section>

        <section className="certificates-stats" aria-label="Certificates summary">
          {summaryStats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="credentials-title">Your credentials</h2>

        <div className="certificates-grid">
          <section className="credential-list" aria-label="Your credentials">
            {credentialRows.map(([title, meta, status, action]) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>{status ? `${meta} - ${status}` : meta}</p>
                </div>
                <button type="button">{action} -&gt;</button>
              </article>
            ))}
          </section>

          <aside className="public-profile-card">
            <h2>Public profile</h2>
            <p>Show selected credentials publicly.</p>
            <button type="button">Manage visibility -&gt;</button>
          </aside>
        </div>
      </section>
    </main>
  );
}
