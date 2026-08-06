"use client";

import { Award } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { encodeId } from "../lib/idCodec";

function shortDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function longDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function CertificatesWallet() {
  const router = useRouter();
  const [backendCertificates, setBackendCertificates] = useState<CertificateResponse[]>([]);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [dashboard, setDashboard] = useState<PublicDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllCertificates, setShowAllCertificates] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getCertificates(), getCurrentUser(), getPublicDashboard()])
      .then(([certificatesResult, userResult, dashboardResult]) => {
        if (!active) return;
        if (certificatesResult.status === "fulfilled") {
          setBackendCertificates(certificatesResult.value);
        }
        if (userResult.status === "fulfilled" && userResult.value) {
          setUser(userResult.value);
        }
        setDashboard(dashboardResult.status === "fulfilled" ? dashboardResult.value : null);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visibleCertificates = useMemo(() => {
    return showAllCertificates ? backendCertificates : backendCertificates.slice(0, 3);
  }, [backendCertificates, showAllCertificates]);

  const summaryStats = useMemo(() => {
    return [
      [String(backendCertificates.length), "Ready"],
      ["0", "In progress"],
      ["0", "Expiring"],
    ] as const;
  }, [backendCertificates]);

  const heroCertificate = backendCertificates[0];

  async function openCertificateFile(certificateId: string, certificateNumber?: string | null) {
    try {
      const blob = await downloadCertificate(certificateId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${certificateNumber || "certificate"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      // download failed - the button remains available to retry
    }
  }

  return (
    <main className="certificates-page">
      <LearningSidebar activeHref="/certificates" dashboard={dashboard} loading={loading} user={user} />

      <section className="certificates-main">
        <header className="certificates-header">
          <div>
            <h1>Certificates</h1>
            <p>Download, verify and share completed credentials.</p>
          </div>
          <button
            type="button"
            onClick={() =>
              router.push(
                heroCertificate
                  ? `/verify-credential?certificateNumber=${encodeId(heroCertificate.certificateNumber)}`
                  : "/verify-credential",
              )
            }
          >
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
              <button
                type="button"
                onClick={() =>
                  heroCertificate
                    ? openCertificateFile(heroCertificate.id, heroCertificate.certificateNumber)
                    : router.push("/explore")
                }
              >
                {heroCertificate ? "Download certificate ->" : "Explore courses ->"}
              </button>
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
            )) : visibleCertificates.length ? (
              <>
                {visibleCertificates.map((certificate) => {
                  const meta = certificate.issuedDate ? `Issued ${shortDate(certificate.issuedDate)}` : "Issued";
                  const status = certificate.certificateNumber ? "Verified" : "";
                  const actionLabel = certificate.fileUrl ? "Download" : "Open";
                  return (
                    <article key={certificate.id}>
                      <div>
                        <h3>{certificate.title || certificate.courseName || "Certificate"}</h3>
                        <p>{status ? `${meta} - ${status}` : meta}</p>
                      </div>
                      <button type="button" onClick={() => openCertificateFile(certificate.id, certificate.certificateNumber)}>
                        {actionLabel} -&gt;
                      </button>
                    </article>
                  );
                })}
                {!showAllCertificates && backendCertificates.length > 3 ? (
                  <button type="button" className="view-all-certificates" onClick={() => setShowAllCertificates(true)}>
                    View all certificates
                  </button>
                ) : null}
              </>
            ) : (
              <article>
                <div>
                  <h3>No credentials issued</h3>
                  <p>Certificates are created from completed course assessments.</p>
                </div>
                <button type="button" onClick={() => router.push("/explore")}>Explore courses -&gt;</button>
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
                <button type="button" onClick={() => router.push("/profile-preferences")}>Manage visibility -&gt;</button>
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
