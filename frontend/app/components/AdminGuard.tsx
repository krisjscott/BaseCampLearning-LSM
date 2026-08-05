"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthSession } from "../lib/backendApi";
import { ADMIN_ROLES } from "../lib/adminApi";
import { Skeleton } from "./Skeleton";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const session = getAuthSession();

    if (!session) {
      router.replace("/");
      return;
    }

    if (!(ADMIN_ROLES as readonly string[]).includes(session.role)) {
      setBlocked(true);
      setChecking(false);
      return;
    }

    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <main className="auth-check-screen">
        <Skeleton className="skeleton-title" />
        <Skeleton className="skeleton-copy" />
      </main>
    );
  }

  if (blocked) {
    return (
      <main className="auth-check-screen">
        <section className="access-denied-panel">
          <span>403</span>
          <h1>Admin access required</h1>
          <p>This route is reserved for BaseCamp administrators.</p>
          <button type="button" onClick={() => router.replace("/learning")}>
            Return to learning
          </button>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
