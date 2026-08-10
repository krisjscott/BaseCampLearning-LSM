"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState, Suspense } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { verifyOtp, resendOtp } from "../lib/backendApi";

function OtpVerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const email = searchParams.get("email") || "";
  const type = searchParams.get("type") || "LOGIN_MFA";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [resendStatus, setResendStatus] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.replace("/");
    }
  }, [email, router]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleChange = (value: string, index: number) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    if (!cleanValue) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];
    if (cleanValue.length > 1) {
      const chars = cleanValue.split("").slice(0, 6 - index);
      chars.forEach((char, i) => {
        newOtp[index + i] = char;
      });
      setOtp(newOtp);
      const focusIndex = Math.min(index + chars.length, 5);
      inputRefs.current[focusIndex]?.focus();
    } else {
      newOtp[index] = cleanValue;
      setOtp(newOtp);
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (pasteData.length === 6) {
      setOtp(pasteData.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResendStatus("");
    setStatus("");
    try {
      await resendOtp(email, type);
      setResendStatus("A new verification code has been sent.");
      setCooldown(60);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to resend code");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("");
    setResendStatus("");

    const code = otp.join("");
    if (code.length !== 6) {
      setStatus("Please enter all 6 digits.");
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyOtp(email, code);
      if (type === "EMAIL_VERIFICATION") {
        router.push("/onboarding");
      } else {
        router.push("/learning");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="form-panel">
      <style>{`
        .auth-page .auth-form input.otp-input-box {
          padding: 0 !important;
          padding-inline: 0 !important;
          margin: 0 !important;
          width: 48px !important;
          height: 56px !important;
          block-size: 56px !important;
          text-align: center !important;
          color: #000000 !important;
        }
      `}</style>
      <Image
        src="/basecamp-logo.png"
        alt="BaseCamp"
        width={148}
        height={91}
        className="brand-logo"
        priority
      />

      <div className="heading-group">
        <h1>{type === "EMAIL_VERIFICATION" ? "Verify your email" : "2-Step Authentication"}</h1>
        <p style={{ marginTop: "8px", color: "var(--muted, #666)" }}>
          We sent a 6-digit code to <strong style={{ color: "var(--ink, #111)" }}>{email}</strong>.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div style={{ display: "flex", gap: "10px", justifyContent: "space-between", margin: "20px 0" }}>
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              ref={(el) => { inputRefs.current[index] = el; }}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              style={{
                borderRadius: "14px",
                border: "1px solid var(--line)",
                backgroundColor: "var(--field)",
                outline: "none",
                transition: "border-color 0.2s"
              }}
              className="otp-input-box"
            />
          ))}
        </div>

        {status && (
          <p className="auth-status" style={{ display: "flex", alignItems: "center", gap: "6px", color: "#e53e3e" }}>
            <AlertCircle size={16} />
            {status}
          </p>
        )}

        {resendStatus && (
          <p className="auth-status" style={{ color: "#2f855a" }}>
            {resendStatus}
          </p>
        )}

        <button type="submit" className="primary-action" disabled={isSubmitting} style={{ marginTop: "10px" }}>
          <span>{isSubmitting ? "Verifying..." : "Verify Code"}</span>
        </button>
      </form>

      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <p style={{ fontSize: "14px", color: "var(--muted, #666)" }}>
          Didn&apos;t receive a code?{" "}
          {cooldown > 0 ? (
            <span>Resend in {cooldown}s</span>
          ) : (
            <button
              onClick={handleResend}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary, #ff5a1f)",
                textDecoration: "underline",
                cursor: "pointer",
                padding: 0,
                fontSize: "14px"
              }}
            >
              Resend Code
            </button>
          )}
        </p>
      </div>

      <div style={{ marginTop: "24px", display: "flex", justifyContent: "center" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", textDecoration: "none", color: "var(--muted, #666)" }}>
          <ArrowLeft size={16} />
          Back to sign in
        </Link>
      </div>
    </section>
  );
}

export default function OtpVerifyPage() {
  return (
    <main className="auth-page">
      <section className="auth-shell" aria-label="BaseCamp OTP verification">
        <aside className="visual-panel" aria-label="Learning progress artwork">
          <div className="visual-frame">
            <div className="image-placeholder-copy">
              <p>Security Verification</p>
              <strong>2-Step OTP check</strong>
              <span>Keep your account safe</span>
            </div>
            <p className="image-replace-note">Secure login portal.</p>
          </div>
        </aside>

        <Suspense fallback={
          <div style={{ padding: "40px", textAlign: "center" }}>
            <p>Loading...</p>
          </div>
        }>
          <OtpVerifyForm />
        </Suspense>
      </section>
    </main>
  );
}
