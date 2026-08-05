"use client";

import { CheckCircle2, LifeBuoy, Mail, RefreshCw } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { forgotPassword, resetPassword } from "../lib/backendApi";

export default function AccessRecoveryDesktop() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ tone: "error" | "success"; message: string } | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token"));
  }, []);

  async function handleRequestReset(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      await forgotPassword(email);
      setRequestSent(true);
    } catch (error) {
      setStatus({ tone: "error", message: error instanceof Error ? error.message : "Could not send a recovery email" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword(event: FormEvent) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ tone: "error", message: "Passwords do not match" });
      return;
    }
    if (!token) return;

    setSubmitting(true);
    setStatus(null);
    try {
      await resetPassword(token, newPassword);
      setResetDone(true);
    } catch (error) {
      setStatus({ tone: "error", message: error instanceof Error ? error.message : "Could not reset your password" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="certificate-detail-page recover-access-page">
      <aside className="learning-sidebar">
        <Link href="/">
          <img src="/basecamp-logo.png" alt="BaseCamp" className="learning-sidebar-logo" />
        </Link>
        <section className="verification-card sidebar-help-card">
          <h2>Need more help?</h2>
          <p>If you no longer have access to your email, contact your organization admin to reset your account.</p>
          <Link href="/">Back to log in -&gt;</Link>
        </section>
      </aside>

      <section className="certificate-detail-main">
        <header className="certificate-detail-header">
          <div>
            <h1>Recover access</h1>
            <p>{token ? "Choose a new password for your account." : "Enter your email and we'll send you a reset link."}</p>
          </div>
        </header>

        <section className="certificate-detail-hero">
          {token ? (
            resetDone ? (
              <>
                <CheckCircle2 size={28} />
                <h2>Password updated</h2>
                <p>You can now log in with your new password.</p>
                <Link href="/">Back to log in -&gt;</Link>
              </>
            ) : (
              <form onSubmit={handleResetPassword} className="compact-inline-form">
                <h2>Set a new password</h2>
                <input
                  type="password"
                  className="inline-text-input"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
                <input
                  type="password"
                  className="inline-text-input"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
                {status && <p className={`status-message ${status.tone === "error" ? "is-error" : "is-success"}`}>{status.message}</p>}
                <button type="submit" disabled={submitting}>
                  <RefreshCw size={18} />
                  <span>{submitting ? "Updating..." : "Update password"}</span>
                </button>
              </form>
            )
          ) : requestSent ? (
            <>
              <Mail size={28} />
              <h2>Check your email</h2>
              <p>If an account exists for {email}, a reset link is on its way.</p>
            </>
          ) : (
            <form onSubmit={handleRequestReset} className="compact-inline-form">
              <h2>Email recovery</h2>
              <p>Enter the email you use for BaseCamp. We&apos;ll send a secure reset link.</p>
              <input
                type="email"
                className="inline-text-input"
                placeholder="name@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
              {status && <p className="status-message is-error">{status.message}</p>}
              <button type="submit" disabled={submitting}>
                <LifeBuoy size={18} />
                <span>{submitting ? "Sending..." : "Send recovery link"}</span>
              </button>
            </form>
          )}
        </section>
      </section>
    </main>
  );
}
