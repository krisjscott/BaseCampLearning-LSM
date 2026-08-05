"use client";

import { BadgeCheck, Search } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "../components/AuthGuard";
import LearningSidebar from "../components/LearningSidebar";
import { CardSkeleton } from "../components/Skeleton";
import {
  CertificateResponse,
  PublicDashboardResponse,
  UserResponse,
  getCurrentUser,
  getPublicDashboard,
  verifyCertificate,
} from "../lib/backendApi";
import { decodeParam, encodeId } from "../lib/idCodec";

function formatDate(value?: string | null) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function PublicCredentialVerification() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [dashboard, setDashboard] = useState<PublicDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [certificateNumber, setCertificateNumber] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [certificate, setCertificate] = useState<CertificateResponse | null>(null);
  const [checking, setChecking] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [copyStatus, setCopyStatus] = useState("Copy verification link");

  useEffect(() => {
    Promise.allSettled([getCurrentUser(), getPublicDashboard()]).then(([userResult, dashboardResult]) => {
      if (userResult.status === "fulfilled") setUser(userResult.value);
      setDashboard(dashboardResult.status === "fulfilled" ? dashboardResult.value : null);
    });

    const initial = decodeParam(new URLSearchParams(window.location.search), "certificateNumber");
    setInputValue(initial || "");
    if (initial) lookup(initial);
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function lookup(number: string) {
    const trimmed = number.trim();
    if (!trimmed) return;
    setChecking(true);
    setLoading(true);
    setNotFound(false);
    setCertificateNumber(trimmed);
    window.history.replaceState(null, "", `/verify-credential?certificateNumber=${encodeId(trimmed)}`);

    verifyCertificate(trimmed)
      .then((result) => {
        if (result) setCertificate(result);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => {
        setChecking(false);
        setLoading(false);
      });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    lookup(inputValue);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyStatus("Link copied");
    } catch {
      setCopyStatus("Could not copy link");
    }
    setTimeout(() => setCopyStatus("Copy verification link"), 2500);
  }

  return (
    <main className="certificate-detail-page verify-credential-page">
      <LearningSidebar activeHref="/certificates" dashboard={dashboard} loading={loading} user={user} />

      <section className="certificate-detail-main">
        <header className="certificate-detail-header">
          <div>
            <h1>Verify credential</h1>
            <p>Confirm a BaseCamp certificate and its current status.</p>
          </div>
          {certificate && (
            <button type="button" onClick={copyLink}>
              <BadgeCheck size={18} />
              <span>{copyStatus}</span>
            </button>
          )}
        </header>

        <form onSubmit={handleSubmit} className="learning-search compact-search-form is-wide">
          <Search size={18} />
          <input
            type="text"
            placeholder="Enter a certificate number, e.g. BC-CW-0148"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            aria-label="Certificate number"
          />
        </form>

        {checking ? (
          <CardSkeleton lines={5} />
        ) : notFound ? (
          <section className="certificate-detail-hero">
            <h2>No certificate found</h2>
            <p>We couldn&apos;t find a certificate matching "{certificateNumber}". Double-check the number and try again.</p>
          </section>
        ) : certificate ? (
          <>
            <section className="certificate-detail-hero">
              <BadgeCheck size={28} />
              <h2>Verified certificate</h2>
              <p>{certificate.courseName || "Course"} - Awarded to {certificate.recipientName || "learner"} - Issued {formatDate(certificate.issuedDate)}.</p>
              {certificate.fileUrl && (
                <a href={certificate.fileUrl} target="_blank" rel="noreferrer">View certificate -&gt;</a>
              )}
            </section>

            <section className="certificate-detail-stats" aria-label="Credential verification summary">
              <article>
                <strong>Verified</strong>
                <p>Status</p>
              </article>
              <article>
                <strong>{certificate.issuerName || "BaseCamp"}</strong>
                <p>Issuer</p>
              </article>
              <article>
                <strong>{certificate.certificateNumber}</strong>
                <p>Credential ID</p>
              </article>
            </section>

            <h2 className="share-certificate-title">Credential record</h2>

            <div className="certificate-detail-grid">
              <section className="certificate-share-list" aria-label="Credential record">
                <article>
                  <div>
                    <h3>Recipient</h3>
                    <p>{certificate.recipientName || "Unknown"}</p>
                  </div>
                </article>
                <article>
                  <div>
                    <h3>Course</h3>
                    <p>{certificate.courseName || "Unknown"}</p>
                  </div>
                </article>
                <article>
                  <div>
                    <h3>Issued</h3>
                    <p>{formatDate(certificate.issuedDate)}</p>
                  </div>
                </article>
              </section>

              <aside className="verification-card">
                <h2>Verification integrity</h2>
                <p>This record is generated directly from BaseCamp's certificate registry.</p>
                <Link href="/help-support">Report an issue -&gt;</Link>
              </aside>
            </div>
          </>
        ) : (
          <section className="certificate-detail-hero">
            <h2>Look up a credential</h2>
            <p>Enter a certificate number above to verify it.</p>
          </section>
        )}
      </section>
    </main>
  );
}

export default function VerifyCredentialPage() {
  return (
    <AuthGuard>
      <PublicCredentialVerification />
    </AuthGuard>
  );
}
