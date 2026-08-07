"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { exchangeGoogleOAuthCode } from "../../lib/backendApi";

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

    const code = params.get("code");

    if (!code) {
      setError("Google sign-in did not complete. Please try again.");
        return;
    }

    // Remove the one-time code from the address bar as soon as it is captured.
    window.history.replaceState({}, document.title, window.location.pathname);

    exchangeGoogleOAuthCode(code)
      .then((auth) => router.replace(auth.newUser ? "/onboarding" : "/learning"))
      .catch((error) => setError(error instanceof Error ? error.message : "Google sign-in did not complete. Please try again."));
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
