"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveAuth } from "../../lib/backendApi";

export default function GoogleOAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const email = params.get("email");
    const role = params.get("role");

    if (!accessToken || !refreshToken || !email || !role) {
      router.replace("/?oauthError=google-sign-up-failed");
      return;
    }

    saveAuth({
      accessToken,
      refreshToken,
      email,
      role,
      fullName: params.get("fullName"),
    });
    router.replace(params.get("newUser") === "true" ? "/onboarding" : "/learning");
  }, [router]);

  return <main className="auth-page" aria-live="polite">Completing Google sign-up…</main>;
}
