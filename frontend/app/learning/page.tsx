"use client";

import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  CalendarClock,
  ChevronRight,
  Compass,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CertificateResponse,
  NotificationResponse,
  PublicDashboardResponse,
  UserResponse,
  getCertificates,
  getCurrentUser,
  getNotifications,
  getPublicDashboard,
} from "../lib/backendApi";
import { encodeId } from "../lib/idCodec";
import AuthGuard from "../components/AuthGuard";
import LearningSidebar from "../components/LearningSidebar";
import NotificationsPanel from "../components/NotificationsPanel";
import { CardSkeleton, Skeleton } from "../components/Skeleton";
import { getLocalGreeting } from "../lib/greeting";

const actionRows = [
  ["Mandatory learning", "Required company and role training.", "Open assignments", BookOpen],
  ["Upcoming checkpoints", "Scheduled assessments and module dates.", "View schedule", CalendarClock],
  ["Recommended paths", "Personalized courses based on your goals.", "Browse courses", Compass],
] as const;

const levelMilestones = [
  { name: "Starter", minXp: 0, nextXp: 100 },
  { name: "Builder", minXp: 100, nextXp: 4000 },
  { name: "Achiever", minXp: 4000, nextXp: 7500 },
  { name: "Champion", minXp: 7500, nextXp: null },
] as const;

function firstName(user?: UserResponse | null) {
  return user?.fullName?.split(" ")[0] || user?.email?.split("@")[0] || "there";
}

function getLevelProgress(xpPoints: number) {
  let currentIndex = 0;
  levelMilestones.forEach((level, index) => {
    if (xpPoints >= level.minXp) currentIndex = index;
  });
  const current = levelMilestones[Math.max(currentIndex, 0)];
  const next = current.nextXp == null ? null : levelMilestones[currentIndex + 1] || null;
  const target = current.nextXp ?? current.minXp;
  const span = Math.max(target - current.minXp, 1);
  const earnedInLevel = Math.max(xpPoints - current.minXp, 0);
  const percentage = current.nextXp == null ? 100 : Math.min(Math.round((earnedInLevel / span) * 100), 100);
  const remaining = current.nextXp == null ? 0 : Math.max(current.nextXp - xpPoints, 0);

  return {
    current,
    next,
    target,
    percentage,
    remaining,
  };
}

const actionHrefs: Record<string, string> = {
  "Mandatory learning": "/mandatory-learning",
  "Upcoming checkpoints": "/learning-calendar",
  "Recommended paths": "/explore",
};

function LearningHome() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [dashboard, setDashboard] = useState<PublicDashboardResponse | null>(null);
  const [certificates, setCertificates] = useState<CertificateResponse[]>([]);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getCurrentUser(), getPublicDashboard(), getCertificates(), getNotifications()])
      .then(([userResult, dashboardResult, certificatesResult, notificationsResult]) => {
        if (!active) return;
        if (userResult.status === "fulfilled" && userResult.value) setUser(userResult.value);
        setDashboard(dashboardResult.status === "fulfilled" ? dashboardResult.value : null);
        setCertificates(certificatesResult.status === "fulfilled" ? certificatesResult.value : []);
        setNotifications(notificationsResult.status === "fulfilled" ? notificationsResult.value : []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const learnerName = firstName(user);
  const featured = dashboard?.continueLearning?.[0];
  const recommendations = dashboard?.recommendedCourses || [];
  const activeCourses = dashboard?.continueLearning?.length || 0;
  const xpPoints = Math.max(0, Math.round(dashboard?.xpPoints || 0));
  const levelProgress = getLevelProgress(xpPoints);
  const unreadNotifications = notifications.filter((item) => !item.read).length;
  const progress = Math.round(featured?.completionPercentage ?? 0);

  const dashboardActions = useMemo(() => {
    if (!recommendations.length) return actionRows;
    return actionRows.map((row, index) => {
      if (index !== 2) return row;
      return [
        "Recommended paths",
        "Personalized courses based on your goals.",
        `${recommendations.length} curated paths`,
        Compass,
      ] as const;
    });
  }, [recommendations]);

  return (
    <main className="learning-home">
      <LearningSidebar activeHref="/learning" dashboard={dashboard} loading={loading} user={user} />

      <section className="learning-main">
        <header className="learning-header">
          <div>
            {loading ? (
              <>
                <Skeleton className="skeleton-title" />
                <Skeleton className="skeleton-copy" />
              </>
            ) : (
              <>
                <h1>{getLocalGreeting()}, {learnerName}.</h1>
                <p>Ready for the next checkpoint?</p>
              </>
            )}
          </div>
          <form
            className="learning-search"
            onSubmit={(event) => {
              event.preventDefault();
              if (searchValue.trim()) router.push(`/search-results?q=${encodeURIComponent(searchValue.trim())}`);
            }}
          >
            <Search size={20} />
            <input
              aria-label="Search courses or ask BaseCamp"
              placeholder="Search courses or ask BaseCamp"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </form>
          <button type="button" className="xp-pill" aria-label="Current XP" onClick={() => router.push("/progress")}>
            <img src="/xp-star.svg" alt="" aria-hidden="true" />
            {loading ? <Skeleton className="skeleton-pill" /> : <span>{xpPoints.toLocaleString()} XP</span>}
          </button>
          <button
            type="button"
            className="notification-button"
            aria-label={unreadNotifications ? `Notifications, ${unreadNotifications} unread` : "Notifications"}
            onClick={() => setNotificationsPanelOpen(true)}
          >
            <Bell size={22} strokeWidth={1.9} />
            {unreadNotifications > 0 && <span className="notification-badge-dot" aria-hidden="true" />}
          </button>
        </header>

        <NotificationsPanel open={notificationsPanelOpen} onClose={() => setNotificationsPanelOpen(false)} />

        <div className="learning-grid">
          <section className="learning-left-column">
            <h2>Your learning</h2>

            <article className="featured-course">
              {loading ? (
                <CardSkeleton lines={6} />
              ) : (
                <>
                  <p>{featured ? "In progress" : "No active course"}</p>
                  <h3>{featured?.courseTitle || "Choose a course to begin"}</h3>
                  <span>{featured ? "Progress loaded from your account" : "Explore the course catalogue to start learning."}</span>
                  <div className="featured-progress" aria-label={`${progress} percent course progress`}>
                    <span style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }} />
                  </div>
                  <div className="progress-copy">
                    <strong>{progress}%</strong>
                    <span>course progress</span>
                  </div>
                  <dl className="course-meta">
                    <div>
                      <dt>Last activity</dt>
                      <dd>{featured?.lastAccessedAt ? new Date(featured.lastAccessedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "No activity yet"}</dd>
                    </div>
                    <div>
                      <dt>Next checkpoint</dt>
                      <dd>{featured ? "Continue from your saved course progress" : "Not scheduled"}</dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    onClick={() => router.push(featured ? `/course?courseId=${encodeId(featured.courseId)}` : "/explore")}
                  >
                    <span>{featured ? "Continue" : "Explore courses"}</span>
                    <ArrowRight size={20} />
                  </button>
                </>
              )}
            </article>

            <section className="timeline-card">
              {loading ? <CardSkeleton lines={2} /> : (
                <>
                  <strong>Course timeline</strong>
                  <p>{featured ? "Timeline updates as you complete lessons and assessments." : "No timeline yet. Enrol in a course to create one."}</p>
                </>
              )}
            </section>

            <div className="learning-action-list">
              {loading ? Array.from({ length: 3 }, (_, index) => (
                <CardSkeleton key={index} lines={2} />
              )) : dashboardActions.map(([title, description, meta, Icon]) => (
                <button type="button" key={title} onClick={() => router.push(actionHrefs[title] || "/explore")}>
                  <span className="action-icon">
                    <Icon size={20} strokeWidth={1.8} />
                  </span>
                  <span>
                    <strong>{title}</strong>
                    <small>{description}</small>
                  </span>
                  <em>{meta}</em>
                  <ChevronRight size={18} />
                </button>
              ))}
            </div>
          </section>

          <aside className="learning-right-column">
            <h2>Today at BaseCamp</h2>

            <section className="stat-card level-card">
              {loading ? <CardSkeleton lines={4} /> : (
                <>
                  <p>Current level</p>
                  <h3>{levelProgress.current.name}</h3>
                  <span>
                    {levelProgress.current.nextXp == null
                      ? `${xpPoints.toLocaleString()} XP`
                      : `${xpPoints.toLocaleString()} / ${levelProgress.target.toLocaleString()} XP`}
                  </span>
                  <div aria-label={`${levelProgress.percentage} percent toward ${levelProgress.next?.name || "top level"}`}>
                    <span style={{ width: `${levelProgress.percentage}%` }} />
                  </div>
                  <small>
                    {levelProgress.next
                      ? `Next: ${levelProgress.next.name} - ${levelProgress.remaining.toLocaleString()} XP to go`
                      : "Top level reached"}
                  </small>
                </>
              )}
            </section>

            <section className="stat-card week-card">
              {loading ? <CardSkeleton lines={3} /> : (
                <>
                  <h3>This week</h3>
                  <div>
                    <strong>{activeCourses}</strong>
                    <span>active learning items</span>
                  </div>
                  <small>Weekly activity appears after lessons are completed.</small>
                </>
              )}
            </section>

            <section className="stat-card certificate-card">
              {loading ? <CardSkeleton lines={4} /> : (
                <>
                  <h3>Certificates</h3>
                  <strong>{certificates.length} ready to download</strong>
                  <p>{activeCourses} courses in progress</p>
                  <button type="button" onClick={() => router.push("/certificates")}>
                    <Award size={16} />
                    <span>View certificates -&gt;</span>
                  </button>
                </>
              )}
            </section>

            <section className="stat-card checkpoint-card">
              {loading ? <CardSkeleton lines={4} /> : (
                <>
                  <p>Notifications</p>
                  <h3>{unreadNotifications ? `${unreadNotifications} unread updates` : "No unread updates"}</h3>
                  <span>{featured ? "Continue learning to unlock assessments." : "No scheduled assessment yet"}</span>
                  <hr />
                  <small>Assessment availability comes from backend progress.</small>
                </>
              )}
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default function LearningPage() {
  return (
    <AuthGuard>
      <LearningHome />
    </AuthGuard>
  );
}
