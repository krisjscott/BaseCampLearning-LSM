"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, BookOpenCheck, CalendarDays, CheckCircle2 } from "lucide-react";
import { login, register } from "./lib/backendApi";

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("demo@basecamp.local");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("password");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await login(email, password);
        router.push("/learning");
      } else {
        await register(email, password, fullName);
        router.push("/onboarding");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not reach BaseCamp backend");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-shell" aria-label="BaseCamp sign in">
        <aside className="visual-panel" aria-label="Learning progress artwork">
          <div className="visual-frame">
            <div className="art-header">
              <span>Learning path</span>
              <strong>78%</strong>
            </div>

            <div className="mentor-card">
              <div className="portrait" aria-hidden="true">
                <span />
              </div>
              <div>
                <p className="eyebrow">Today&apos;s guide</p>
                <h2>Build skills one focused step at a time.</h2>
              </div>
            </div>

            <div className="progress-track" aria-hidden="true">
              <span />
            </div>

            <div className="lesson-stack" aria-hidden="true">
              <div className="lesson-card active">
                <BookOpenCheck size={18} strokeWidth={2.2} />
                <div>
                  <p>Product basics</p>
                  <span>Completed</span>
                </div>
                <CheckCircle2 size={18} />
              </div>
              <div className="lesson-card">
                <CalendarDays size={18} strokeWidth={2.2} />
                <div>
                  <p>Team onboarding</p>
                  <span>Next session</span>
                </div>
                <span className="time-pill">10:30</span>
              </div>
            </div>
          </div>

          <div className="visual-caption">
            <p>Pick up where you left off.</p>
            <span>Courses, progress, and organisation learning in one place.</span>
          </div>
        </aside>

        <section className="form-panel">
          <Image
            src="/BasecampLogoExact.png"
            alt="BaseCamp"
            width={148}
            height={91}
            className="brand-logo"
            priority
          />

          <div className="heading-group">
            <h1>Log in or create account</h1>
            <p>Use your BaseCamp account to continue.</p>
          </div>

          <div className="auth-mode-switch" aria-label="Authentication mode">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
            >
              Log in
            </button>
            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => setMode("register")}
            >
              Create
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "register" ? (
              <>
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  name="fullName"
                  placeholder="Your name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  autoComplete="name"
                />
              </>
            ) : null}

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
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              type="password"
              minLength={mode === "register" ? 8 : undefined}
              required
            />

            {status ? <p className="auth-status">{status}</p> : null}

            <button type="submit" className="primary-action" disabled={isSubmitting}>
              <span>{isSubmitting ? "Connecting..." : "Continue"}</span>
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </form>

          <div className="divider" aria-hidden="true">
            <span />
            <p>OR</p>
            <span />
          </div>

          <button type="button" className="google-action">
            <span className="google-mark" aria-hidden="true">
              G
            </span>
            <span>Continue with Google</span>
          </button>

          <div className="organisation-note">
            <strong>Using BaseCamp through an organisation?</strong>
            <p>Enter the Crew ID provided to you in the field above.</p>
          </div>

          <p className="legal-copy">
            By continuing, you agree to the Terms of Use and Privacy Policy.
          </p>
        </section>
      </section>
    </main>
  );
}
