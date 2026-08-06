"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { ArrowRight, BookOpenCheck, CalendarDays, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { getGoogleOAuthUrl, login, register } from "./lib/backendApi";
import TurnstileWidget, { TurnstileWidgetHandle } from "./components/TurnstileWidget";
import GoogleIcon from "./components/GoogleIcon";

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: boolean; email?: boolean; password?: boolean }>({});
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");

    // The form uses noValidate so the browser's own "Please fill out this
    // field" bubble never shows - it looks like a stray OS tooltip next to
    // this app's own themed design. This is the themed replacement: same
    // check, styled like every other inline error on this page.
    const nextFieldErrors = {
      fullName: mode === "register" && !fullName.trim(),
      email: !email.trim(),
      password: !password.trim(),
    };
    setFieldErrors(nextFieldErrors);
    if (nextFieldErrors.fullName || nextFieldErrors.email || nextFieldErrors.password) {
      setStatus("Please fill out the highlighted field" + (Object.values(nextFieldErrors).filter(Boolean).length > 1 ? "s" : "") + ".");
      return;
    }

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
            <p>Use your email to continue.</p>
          </div>

          <div className="auth-mode-switch" aria-label="Authentication mode">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => { setMode("login"); setFieldErrors({}); setStatus(""); }}
            >
              Log in
            </button>
            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => { setMode("register"); setFieldErrors({}); setStatus(""); }}
            >
              Create
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {mode === "register" ? (
              <>
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  name="fullName"
                  placeholder="Your name"
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    if (fieldErrors.fullName) setFieldErrors((current) => ({ ...current, fullName: false }));
                  }}
                  autoComplete="name"
                  className={fieldErrors.fullName ? "field-invalid" : ""}
                />
              </>
            ) : null}

            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              placeholder="name@email.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (fieldErrors.email) setFieldErrors((current) => ({ ...current, email: false }));
              }}
              autoComplete="email"
              type="email"
              className={fieldErrors.email ? "field-invalid" : ""}
            />

            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                name="password"
                placeholder="Enter password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (fieldErrors.password) setFieldErrors((current) => ({ ...current, password: false }));
                }}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                type={passwordVisible ? "text" : "password"}
                minLength={mode === "register" ? 8 : undefined}
                className={fieldErrors.password ? "field-invalid" : ""}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setPasswordVisible((visible) => !visible)}
                aria-label={passwordVisible ? "Hide password" : "Show password"}
                aria-pressed={passwordVisible}
                tabIndex={-1}
              >
                {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {mode === "login" && (
              <a href="/recover-access" className="forgot-password-link">Forgot your password?</a>
            )}

            {status ? <p className="auth-status">{status}</p> : null}

            <TurnstileWidget ref={turnstileRef} />

            <button type="submit" className="primary-action" disabled={isSubmitting}>
              <span>{isSubmitting ? "Connecting..." : "Continue"}</span>
            </button>
          </form>

          <div className="divider">
            <span />
            <p>OR</p>
            <span />
          </div>

          <button type="button" className="google-action" onClick={() => { window.location.href = getGoogleOAuthUrl(); }}>
            <GoogleIcon size={18} />
            <span>Continue with Google</span>
          </button>

          <p className="legal-copy">
            By continuing, you agree to the Terms of Use and Privacy Policy.
          </p>
        </section>
      </section>
    </main>
  );
}
