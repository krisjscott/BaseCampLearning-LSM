"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthSession } from "../lib/backendApi";
import { Skeleton } from "./Skeleton";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!getAuthSession()) {
      router.replace("/");
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

  return <>{children}</>;
}
