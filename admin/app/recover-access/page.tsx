"use client";

import { CheckCircle2, LifeBuoy, Mail, RefreshCw } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { forgotPassword, resetPassword } from "../lib/backendApi";

export default function AdminAccessRecoveryPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token"));
  }, []);

  async function submitRequest(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) return setStatus("Please enter your email address.");
    setSubmitting(true);
    setStatus(null);
    try {
      await forgotPassword(email);
      setRequestSent(true);
    } catch {
      setStatus("Could not send the recovery email. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitReset(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    if (newPassword.length < 8) return setStatus("Password must be at least 8 characters.");
    if (newPassword !== confirmPassword) return setStatus("Passwords do not match.");
    setSubmitting(true);
    setStatus(null);
    try {
      await resetPassword(token, newPassword);
      setResetDone(true);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not reset your password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <section className="form-panel">
          <div className="heading-group">
            <h1>Recover admin access</h1>
            <p>{token ? "Choose a new password for your account." : "We will send a secure reset link to your admin email."}</p>
          </div>
          {token ? (
            resetDone ? (
              <div className="auth-status"><CheckCircle2 size={20} /> Password updated. <Link href="/login">Sign in</Link></div>
            ) : (
              <form className="auth-form" onSubmit={submitReset}>
                <label htmlFor="new-password">New password</label>
                <input id="new-password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} required autoComplete="new-password" />
                <label htmlFor="confirm-password">Confirm password</label>
                <input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required autoComplete="new-password" />
                {status && <p className="auth-status">{status}</p>}
                <button type="submit" className="primary-action" disabled={submitting}><RefreshCw size={17} /> {submitting ? "Updating..." : "Update password"}</button>
              </form>
            )
          ) : requestSent ? (
            <div className="auth-status"><Mail size={20} /> Check your email for a reset link.</div>
          ) : (
            <form className="auth-form" onSubmit={submitRequest}>
              <label htmlFor="email">Admin email</label>
              <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
              {status && <p className="auth-status">{status}</p>}
              <button type="submit" className="primary-action" disabled={submitting}><LifeBuoy size={17} /> {submitting ? "Sending..." : "Send reset link"}</button>
              <Link href="/login">Back to sign in</Link>
            </form>
          )}
        </section>
      </section>
    </main>
  );
}
