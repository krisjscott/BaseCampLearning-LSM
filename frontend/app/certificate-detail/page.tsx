"use client";

import {
  BadgeCheck,
  CalendarDays,
  Copy,
  Download,
  ExternalLink,
  KeyRound,
  Link as LinkIcon,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "../components/AuthGuard";
import LearningSidebar from "../components/LearningSidebar";
import { CardSkeleton } from "../components/Skeleton";
import {
  CertificateResponse,
  PublicDashboardResponse,
  UserResponse,
  downloadCertificate,
  getCertificates,
  getCurrentUser,
  getPublicDashboard,
} from "../lib/backendApi";
import { decodeParam, encodeId } from "../lib/idCodec";

function longDate(value?: string | null) {
  if (!value) return "Recently recorded";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function CertificateDetailContent() {
  const router = useRouter();
  const [certificateId, setCertificateId] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<CertificateResponse | null>(null);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [dashboard, setDashboard] = useState<PublicDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    let active = true;
    const id = decodeParam(new URLSearchParams(window.location.search), "certificateId");
    setCertificateId(id);

    Promise.allSettled([getCertificates(), getCurrentUser(), getPublicDashboard()])
      .then(([certificatesResult, userResult, dashboardResult]) => {
        if (!active) return;
        if (certificatesResult.status === "fulfilled") {
          const match = id ? certificatesResult.value.find((item) => item.id === id) : null;
          setCertificate(match || null);
        }
        if (userResult.status === "fulfilled") setUser(userResult.value);
        setDashboard(dashboardResult.status === "fulfilled" ? dashboardResult.value : null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const verifyUrl = certificate
    ? `${window.location.origin}/verify-credential?certificateNumber=${encodeId(certificate.certificateNumber)}`
    : "";

  async function downloadPdf() {
    if (!certificate) return;
    try {
      const blob = await downloadCertificate(certificate.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${certificate.certificateNumber || "certificate"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      // download failed - the button remains available to retry
    }
  }

  async function copyVerificationLink() {
    if (!certificate) return;
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopyStatus("Link copied");
    } catch {
      setCopyStatus("Could not copy link");
    }
    setTimeout(() => setCopyStatus(""), 2500);
  }

  function shareOnLinkedIn() {
    if (!certificate) return;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`, "_blank");
  }

  const stats = certificate
    ? ([
        [longDate(certificate.issuedDate), "Issue date", CalendarDays],
        ["No expiry", "Validity", ShieldCheck],
        [certificate.certificateNumber, "Credential ID", KeyRound],
      ] as const)
    : [];

  if (!loading && (!certificateId || !certificate)) {
    return (
      <main className="certificate-detail-page">
        <LearningSidebar activeHref="/certificates" dashboard={dashboard} loading={loading} user={user} />
        <section className="certificate-detail-main">
          <header className="certificate-detail-header">
            <div>
              <h1>Certificate not found</h1>
              <p>This certificate could not be located. It may have been removed or the link is incorrect.</p>
            </div>
          </header>
          <section className="certificate-detail-hero">
            <button type="button" onClick={() => router.push("/certificates")}>Back to certificates</button>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="certificate-detail-page">
      <LearningSidebar activeHref="/certificates" dashboard={dashboard} loading={loading} user={user} />

      <section className="certificate-detail-main">
        <header className="certificate-detail-header">
          <div>
            <h1>Certificate Detail</h1>
            <p>A verified record of completed learning.</p>
          </div>
          {loading ? null : (
            <button type="button" onClick={downloadPdf}>
              <Download size={18} />
              <span>Download PDF</span>
            </button>
          )}
        </header>

        {loading ? (
          <CardSkeleton lines={6} />
        ) : certificate ? (
          <>
            <section className="certificate-detail-hero">
              <BadgeCheck size={28} />
              <h2>Certified in {certificate.courseName || certificate.title}</h2>
              <p>
                Awarded to {certificate.recipientName || user?.fullName || "you"} after completing all required
                modules and assessments.
              </p>
              <button
                type="button"
                onClick={() => router.push(`/verify-credential?certificateNumber=${encodeId(certificate.certificateNumber)}`)}
              >
                Verify credential -&gt;
              </button>
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
                <article>
                  <div className="list-row-copy">
                    <BadgeCheck size={18} />
                    <div>
                      <h3>LinkedIn</h3>
                      <p>Add to licenses and certifications</p>
                    </div>
                  </div>
                  <button type="button" onClick={shareOnLinkedIn}>
                    <Share2 size={15} />
                    <span>Share -&gt;</span>
                  </button>
                </article>
                <article>
                  <div className="list-row-copy">
                    <LinkIcon size={18} />
                    <div>
                      <h3>Public verification link</h3>
                      <p>Copy credential URL</p>
                    </div>
                  </div>
                  <button type="button" onClick={copyVerificationLink}>
                    <Copy size={15} />
                    <span>{copyStatus || "Copy"} -&gt;</span>
                  </button>
                </article>
              </section>

              <aside className="verification-card">
                <h2>Verification</h2>
                <p>Credential status: Active and verified.</p>
                <button
                  type="button"
                  onClick={() => window.open(verifyUrl, "_blank")}
                >
                  <ExternalLink size={15} />
                  <span>Open public record -&gt;</span>
                </button>
              </aside>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}

export default function CertificateDetailPage() {
  return (
    <AuthGuard>
      <CertificateDetailContent />
    </AuthGuard>
  );
}
