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
import { NotificationResponse, UserResponse, getCurrentUser, getNotifications } from "../lib/backendApi";

const navItems = [
  ["Learning Home", Home, true],
  ["My Learning", BookOpen, false],
  ["Explore", Compass, false],
  ["Achievements", Trophy, false],
  ["Certificates", Award, false],
  ["Progress", BarChart3, false],
] as const;

const trails = [
  ["Project Management", "58%"],
  ["Content Writing", "24%"],
  ["Graphic Design", "8%"],
] as const;

const stats = [
  ["6", "Unread"],
  ["2", "Deadline alerts"],
  ["3", "Course updates"],
] as const;

const recentNotifications = [
  ["Checkpoint reminder", "Quiz scheduled for Jul 28", "Open course"],
  ["Certificate ready", "Content Writing certificate is available", "Download"],
  ["New recommendation", "Communication Mastery matches your goals", "View"],
] as const;

export default function Notifications() {
  const [backendNotifications, setBackendNotifications] = useState<NotificationResponse[]>([]);
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getNotifications(), getCurrentUser()])
      .then(([notificationsResult, userResult]) => {
        if (!active) return;
        if (notificationsResult.status === "fulfilled" && notificationsResult.value.length) {
          setBackendNotifications(notificationsResult.value);
        }
        if (userResult.status === "fulfilled" && userResult.value) {
          setUser(userResult.value);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const notificationRows = useMemo(() => {
    if (!backendNotifications.length) return recentNotifications;
    return backendNotifications.slice(0, 3).map((item) => [
      item.title,
      item.message,
      item.actionUrl ? "Open" : item.read ? "Read" : "Review",
    ] as const);
  }, [backendNotifications]);

  const summaryStats = useMemo(() => {
    if (!backendNotifications.length) return stats;
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
  const learnerName = user?.fullName?.split(" ")[0] || user?.email?.split("@")[0] || "Nirjhar";

  return (
    <main className="notifications-page">
      <aside className="learning-sidebar">
        <img src="/BasecampLogoExact.png" alt="BaseCamp" className="learning-sidebar-logo" />

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
          {trails.map(([name, progress]) => (
            <div key={name}>
              <span>{name}</span>
              <strong>{progress}</strong>
            </div>
          ))}
        </section>
        <section className="learner-profile" aria-label="Learner profile">
          <div>{learnerName.charAt(0).toUpperCase()}</div>
          <section>
            <strong>{learnerName}</strong>
            <span>Builder - 2,480 XP</span>
            <small>BC-CR-021</small>
          </section>
        </section>
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
          <h2>{heroNotification?.title || "One deadline needs attention"}</h2>
          <p>{heroNotification?.message || "Workplace Safety Essentials is due Jul 30."}</p>
          <button type="button">Review deadline -&gt;</button>
        </section>

        <section className="notifications-stats" aria-label="Notifications summary">
          {summaryStats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="recent-notifications-title">Recent notifications</h2>

        <div className="notifications-content-grid">
          <section className="notification-list" aria-label="Recent notifications">
            {notificationRows.map(([title, detail, action]) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </div>
                <button type="button">{action} -&gt;</button>
              </article>
            ))}
          </section>

          <aside className="notification-preferences-card">
            <h2>Preferences</h2>
            <p>Choose email and in-product notification types.</p>
            <button type="button">Manage preferences -&gt;</button>
          </aside>
        </div>
      </section>
    </main>
  );
}
