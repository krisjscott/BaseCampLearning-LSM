"use client";

import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Compass,
  Home,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { NotificationResponse, UserResponse, getCurrentUser, getNotifications } from "../lib/backendApi";
import AuthGuard from "../components/AuthGuard";
import { CardSkeleton, SidebarSkeleton, Skeleton } from "../components/Skeleton";

const navItems = [
  ["Learning Home", Home, true],
  ["My Learning", BookOpen, false],
  ["Explore", Compass, false],
  ["Achievements", Trophy, false],
  ["Certificates", Award, false],
  ["Progress", BarChart3, false],
] as const;

function Notifications() {
  const [backendNotifications, setBackendNotifications] = useState<NotificationResponse[]>([]);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getNotifications(), getCurrentUser()])
      .then(([notificationsResult, userResult]) => {
        if (!active) return;
        if (notificationsResult.status === "fulfilled") {
          setBackendNotifications(notificationsResult.value);
        }
        if (userResult.status === "fulfilled" && userResult.value) {
          setUser(userResult.value);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const notificationRows = useMemo(() => {
    return backendNotifications.slice(0, 3).map((item) => [
      item.title,
      item.message,
      item.actionUrl ? "Open" : item.read ? "Read" : "Review",
    ] as const);
  }, [backendNotifications]);

  const summaryStats = useMemo(() => {
    const unread = backendNotifications.filter((item) => !item.read).length;
    const deadlineAlerts = backendNotifications.filter((item) => item.category === "DEADLINE_REMINDER").length;
    const courseUpdates = backendNotifications.filter((item) => item.category === "COURSE_ASSIGNED").length;
    return [
      [String(unread), "Unread"],
      [String(deadlineAlerts), "Deadline alerts"],
      [String(courseUpdates), "Course updates"],
    ] as const;
  }, [backendNotifications]);

  const heroNotification = backendNotifications.find((item) => !item.read) || backendNotifications[0];
  const learnerName = user?.fullName?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <main className="notifications-page">
      <aside className="learning-sidebar">
        <img src="/basecamp-logo.png" alt="BaseCamp" className="learning-sidebar-logo" />

        <nav className="learning-nav" aria-label="Learning sections">
          {navItems.map(([label, Icon, active]) => (
            <button type="button" className={active ? "active" : ""} key={label}>
              <Icon size={22} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <section className="recent-trails" aria-label="Recent trails">
          <p>Recent trails</p>
          {loading ? <SidebarSkeleton /> : <small>No course progress yet</small>}
        </section>
        <Link href="/profile-preferences" className="learner-profile" aria-label="Open profile preferences">
          {loading ? (
            <>
              <div><Skeleton className="skeleton-pill" /></div>
              <SidebarSkeleton />
            </>
          ) : (
            <>
              <div>{learnerName.charAt(0).toUpperCase()}</div>
              <section>
                <strong>{learnerName}</strong>
                <span>{user?.role || "Learner"}</span>
                <small>{user?.learnerCode || "Profile code pending"}</small>
              </section>
            </>
          )}
        </Link>
      </aside>

      <section className="notifications-main">
        <header className="notifications-header">
          <div>
            <h1>Notifications</h1>
            <p>Course updates, reminders and achievement activity.</p>
          </div>
          <button type="button">
            <Bell size={18} />
            <span>Mark all read</span>
          </button>
        </header>

        <section className="notifications-hero">
          {loading ? <CardSkeleton lines={3} /> : (
            <>
              <h2>{heroNotification?.title || "No notifications yet"}</h2>
              <p>{heroNotification?.message || "Course updates and reminders will appear here."}</p>
              <button type="button">{heroNotification ? "Review notification ->" : "Manage preferences ->"}</button>
            </>
          )}
        </section>

        <section className="notifications-stats" aria-label="Notifications summary">
          {loading ? Array.from({ length: 3 }, (_, index) => (
            <article key={index}>
              <CardSkeleton lines={2} />
            </article>
          )) : summaryStats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="recent-notifications-title">Recent notifications</h2>

        <div className="notifications-content-grid">
          <section className="notification-list" aria-label="Recent notifications">
            {loading ? Array.from({ length: 3 }, (_, index) => (
              <CardSkeleton key={index} lines={2} />
            )) : notificationRows.length ? notificationRows.map(([title, detail, action]) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </div>
                <button type="button">{action} -&gt;</button>
              </article>
            )) : (
              <article>
                <div>
                  <h3>No recent notifications</h3>
                  <p>Your backend notifications table has no records for this account.</p>
                </div>
                <button type="button">Preferences -&gt;</button>
              </article>
            )}
          </section>

          <aside className="notification-preferences-card">
            {loading ? <CardSkeleton lines={3} /> : (
              <>
                <h2>Preferences</h2>
                <p>Choose email and in-product notification types.</p>
                <button type="button">Manage preferences -&gt;</button>
              </>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

export default function NotificationsPage() {
  return (
    <AuthGuard>
      <Notifications />
    </AuthGuard>
  );
}
