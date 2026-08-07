"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { login } from "../lib/backendApi";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not reach BaseCamp backend");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-shell" aria-label="BaseCamp Ops Console sign in">
        <section className="form-panel">
          <Image
            src="/basecamp-logo.png"
            alt="BaseCamp"
            width={148}
            height={91}
            className="brand-logo"
            priority
          />

          <div className="heading-group">
            <h1>Ops Console sign in</h1>
            <p>Use your BaseCamp administrator email to continue.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              placeholder="name@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              type="email"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              type="password"
              required
            />

            <Link href="/recover-access" className="forgot-password-link">Forgot your password?</Link>

            {status ? <p className="auth-status">{status}</p> : null}

            <button type="submit" className="primary-action" disabled={isSubmitting}>
              <span>{isSubmitting ? "Connecting..." : "Continue"}</span>
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
