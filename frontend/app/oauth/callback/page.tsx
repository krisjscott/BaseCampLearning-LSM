"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { saveAuth } from "../../lib/backendApi";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error");
    if (oauthError) {
      setError(oauthError);
      return;
    }

    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const email = params.get("email");
    const role = params.get("role");

    if (!accessToken || !refreshToken || !email || !role) {
      setError("Google sign-in did not complete. Please try again.");
      return;
    }

    saveAuth({ accessToken, refreshToken, email, role, fullName: params.get("fullName") });
    router.replace(params.get("newUser") === "true" ? "/onboarding" : "/learning");
  }, [router]);

  return (
    <main className="oauth-callback-page">
      {error ? (
        <div className="oauth-callback-card">
          <AlertCircle size={28} />
          <h1>Couldn&apos;t sign you in</h1>
          <p>{error}</p>
          <button type="button" onClick={() => router.replace("/")}>Back to sign in</button>
        </div>
      ) : (
        <div className="oauth-callback-card">
          <div className="oauth-callback-spinner" aria-hidden="true" />
          <p>Signing you in...</p>
        </div>
      )}
    </main>
  );
}
