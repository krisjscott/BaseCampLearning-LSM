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
  const googleSignUpUrl = process.env.NEXT_PUBLIC_GOOGLE_SIGN_UP_URL?.trim();

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

  function handleGoogleSignUp() {
    setStatus("");

    if (!googleSignUpUrl) {
      setStatus("Google sign-up is not configured yet. Please use email to continue.");
      return;
    }

    window.location.assign(googleSignUpUrl);
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
            <p>Use your email to continue.</p>
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

            {mode === "login" && (
              <a href="/recover-access" className="forgot-password-link">Forgot your password?</a>
            )}

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

          <button type="button" className="google-action" onClick={handleGoogleSignUp}>
            <svg className="google-mark" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M21.8 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.5a4.7 4.7 0 0 1-2.04 3.08v2.52h3.25c1.9-1.75 3.09-4.33 3.09-7.43Z"
              />
              <path
                fill="#34A853"
                d="M12 22c2.75 0 5.06-.91 6.75-2.34l-3.25-2.52c-.91.61-2.06.97-3.5.97-2.65 0-4.9-1.79-5.7-4.2H3.05v2.6A10.19 10.19 0 0 0 12 22Z"
              />
              <path
                fill="#FBBC05"
                d="M6.3 13.91A6.12 6.12 0 0 1 6 12c0-.66.11-1.3.3-1.91v-2.6H3.05A10 10 0 0 0 2 12c0 1.61.39 3.14 1.05 4.51l3.25-2.6Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.89c1.57 0 2.98.54 4.09 1.61l3.07-3.07C17.05 2.45 14.75 1.2 12 1.2a10.19 10.19 0 0 0-8.95 6.29l3.25 2.6c.8-2.41 3.05-4.2 5.7-4.2Z"
              />
            </svg>
            <span>Sign up with Google</span>
          </button>

          <p className="legal-copy">
            By continuing, you agree to the Terms of Use and Privacy Policy.
          </p>
        </section>
      </section>
    </main>
  );
}
