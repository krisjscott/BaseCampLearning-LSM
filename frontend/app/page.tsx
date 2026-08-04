"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { ArrowRight, BookOpenCheck, CalendarDays, CheckCircle2 } from "lucide-react";
import { login, register } from "./lib/backendApi";
import TurnstileWidget, { TurnstileWidgetHandle } from "./components/TurnstileWidget";

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);

    const turnstileToken = turnstileRef.current?.getToken() ?? null;

    try {
      if (mode === "login") {
        await login(email, password, turnstileToken);
        router.push("/learning");
      } else {
        await register(email, password, fullName, turnstileToken);
        router.push("/onboarding");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not reach BaseCamp backend");
      turnstileRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-shell" aria-label="BaseCamp sign in">
        <aside className="visual-panel" aria-label="Learning progress artwork">
          <div className="visual-frame">
            <div className="image-placeholder-copy">
              <p>Image placeholder</p>
              <strong>Learning image</strong>
              <span>Responsive safe area</span>
            </div>

            <div className="image-guidance-card">
              <p>Image guidance</p>
              <span>
                Use a focused learning, people or progress image. Keep important subjects inside the
                responsive safe area.
              </span>
            </div>

            <p className="image-replace-note">Replace this layer with the final artwork.</p>
          </div>
        </aside>

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
            <h1>Log in or create account</h1>
            <p>Use your email or Crew ID to continue.</p>
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

            <label htmlFor="email">Email or Crew ID</label>
            <input
              id="email"
              name="email"
              placeholder="name@email.com or Crew ID"
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

            <TurnstileWidget ref={turnstileRef} />

            <button type="submit" className="primary-action" disabled={isSubmitting}>
              <span>{isSubmitting ? "Connecting..." : "Continue"}</span>
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
