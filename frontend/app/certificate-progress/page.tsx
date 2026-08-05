"use client";

import { ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "../components/AuthGuard";
import { CardSkeleton } from "../components/Skeleton";
import {
  CourseProgressResponse,
  UserResponse,
  getCourseProgress,
  getCurrentUser,
} from "../lib/backendApi";
import { decodeParam, encodeId } from "../lib/idCodec";

function CertificateProgressContent() {
  const router = useRouter();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [progress, setProgress] = useState<CourseProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const id = decodeParam(new URLSearchParams(window.location.search), "courseId");
    setCourseId(id);

    getCurrentUser()
      .then((currentUser) => {
        if (!active) return;
        setUser(currentUser);
        if (!id || !currentUser) {
          setLoading(false);
          return;
        }
        getCourseProgress(id, currentUser.id)
          .then((value) => {
            if (active) setProgress(value);
          })
          .finally(() => {
            if (active) setLoading(false);
          });
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const completion = Math.round(progress?.completionPercentage || 0);
  const exitHref = courseId ? `/course?courseId=${encodeId(courseId)}` : "/learning";
  const continueHref = courseId ? `/course?courseId=${encodeId(courseId)}` : "/explore";

  return (
    <main className="certificate-progress-page">
      <header className="lesson-topbar">
        <div className="lesson-brand-block">
          <img src="/basecamp-logo.png" alt="BaseCamp" />
          <span />
          <section>
            <strong>{progress?.courseTitle || "Selected course"}</strong>
            <p>Module checkpoint - Required assessment</p>
          </section>
        </div>
        <div className="lesson-top-actions">
          <button type="button" onClick={() => router.push(exitHref)}>
            <X size={16} />
            <span>Exit quiz</span>
          </button>
        </div>
      </header>

      <section className="certificate-progress-content">
        {loading ? (
          <CardSkeleton lines={6} />
        ) : (
          <>
            <p>Checkpoint passed</p>
            <h1>One step closer to certification</h1>

            <section className="certificate-progress-card">
              <div className="certificate-copy">
                <p>{progress?.courseTitle || "Selected course"}</p>
                <h2>Certificate progress: {completion}%</h2>
                <div className="certificate-progress-bar" aria-label={`Certificate progress ${completion} percent`}>
                  <span style={{ width: `${completion}%` }} />
                </div>
                <p className="certificate-status">
                  {progress
                    ? `${completion}% complete. Certificate unlocks automatically at 100%.`
                    : "No course progress found. Start a course to begin tracking certificate progress."}
                </p>
                <button type="button" onClick={() => router.push(continueHref)}>
                  <ArrowRight size={16} />
                  <span>Continue course</span>
                </button>
              </div>

              <div className="certificate-preview">
                <strong>base camp</strong>
                <span>Certificate of completion</span>
                <h2>{user?.fullName || "Learner"}</h2>
                <p>Preview - Unlocks at course completion</p>
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

export default function CertificateProgressPage() {
  return (
    <AuthGuard>
      <CertificateProgressContent />
    </AuthGuard>
  );
}
