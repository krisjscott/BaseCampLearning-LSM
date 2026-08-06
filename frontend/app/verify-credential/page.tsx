"use client";

import { BadgeCheck, Search } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { CertificateResponse, verifyCertificate } from "../lib/backendApi";
import { CardSkeleton } from "../components/Skeleton";
import { decodeParam, encodeId } from "../lib/idCodec";

function formatDate(value?: string | null) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

// Deliberately standalone - no AuthGuard, no LearningSidebar, no app nav.
// This page is meant to be opened by anyone from a QR code or a shared link,
// including someone with no BaseCamp account at all, so it must not show or
// require any part of the logged-in app shell.
export default function VerifyCredentialPage() {
  const [certificateNumber, setCertificateNumber] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [certificate, setCertificate] = useState<CertificateResponse | null>(null);
  const [checking, setChecking] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [copyStatus, setCopyStatus] = useState("Copy verification link");

  useEffect(() => {
    const initial = decodeParam(new URLSearchParams(window.location.search), "certificateNumber");
    setInputValue(initial || "");
    if (initial) lookup(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function lookup(number: string) {
    const trimmed = number.trim();
    if (!trimmed) return;
    setChecking(true);
    setNotFound(false);
    setLookupError("");
    setCertificateNumber(trimmed);
    window.history.replaceState(null, "", `/verify-credential?certificateNumber=${encodeId(trimmed)}`);

    verifyCertificate(trimmed)
      .then((result) => {
        if (result) setCertificate(result);
        else setNotFound(true);
      })
      .catch((error: unknown) => {
        // A real 404 means this certificate number genuinely doesn't exist -
        // anything else (network drop, the backend being mid-restart, a 500)
        // is a different situation and shouldn't be reported the same way,
        // since that reads as "this certificate is invalid" when it might
        // just mean "try again in a moment."
        const status = error instanceof Error ? (error as Error & { status?: number }).status : undefined;
        if (status === 404) {
          setNotFound(true);
        } else {
          setLookupError(error instanceof Error ? error.message : "Could not reach the verification service. Please try again.");
        }
      })
      .finally(() => setChecking(false));
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
    <main className="verify-bare-page">
      <header className="verify-bare-header">
        <img src="/basecamp-logo.png" alt="BaseCamp" />
        <div>
          <h1>Verify credential</h1>
          <p>Confirm a BaseCamp certificate and its current status. No account needed.</p>
        </div>
      </header>

      <section className="verify-bare-body">
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
        ) : lookupError ? (
          <section className="certificate-detail-hero">
            <h2>Verification unavailable right now</h2>
            <p>{lookupError} This doesn&apos;t mean the certificate is invalid - please try again in a moment.</p>
          </section>
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
              <div className="verify-bare-hero-actions">
                {certificate.fileUrl && (
                  <a href={certificate.fileUrl} target="_blank" rel="noreferrer">View certificate -&gt;</a>
                )}
                <button type="button" onClick={copyLink}>
                  <BadgeCheck size={16} />
                  <span>{copyStatus}</span>
                </button>
              </div>
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

            <p className="verify-bare-footnote">This record is generated directly from BaseCamp&apos;s certificate registry.</p>
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
