"use client";

import { Bell, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  NotificationResponse,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../lib/backendApi";
import { CardSkeleton } from "./Skeleton";

export default function NotificationsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (!open || loaded) return;
    let active = true;
    setLoading(true);
    getNotifications()
      .then((rows) => active && setNotifications(rows))
      .catch(() => undefined)
      .finally(() => {
        if (active) {
          setLoading(false);
          setLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, [open, loaded]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    document.body.classList.add("notification-panel-open");
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("notification-panel-open");
    };
  }, [open, onClose]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  function openNotification(item: NotificationResponse) {
    if (!item.read) {
      setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
      markNotificationRead(item.id).catch(() => undefined);
    }
    if (item.actionUrl) {
      onClose();
      router.push(item.actionUrl);
    }
  }

  async function handleMarkAllRead() {
    if (!unreadCount) return;
    setMarkingAll(true);
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    try {
      await markAllNotificationsRead();
    } catch {
      // best-effort; local state already reflects the intent
    } finally {
      setMarkingAll(false);
    }
  }

  if (!open) return null;

  return (
    <div className="notification-panel-overlay" onClick={onClose}>
      <aside className="notification-panel" onClick={(event) => event.stopPropagation()} aria-label="Notifications">
        <header className="notification-panel-header">
          <h2>Notifications</h2>
          <div className="notification-panel-header-actions">
            <button
              type="button"
              className="notification-panel-mark-all"
              onClick={handleMarkAllRead}
              disabled={!unreadCount || markingAll}
            >
              {markingAll ? "Marking..." : "Mark all read"}
            </button>
            <button type="button" className="notification-panel-close" onClick={onClose} aria-label="Close notifications">
              <X size={18} strokeWidth={2.2} />
            </button>
          </div>
        </header>

        <div className="notification-panel-body">
          {loading ? (
            <div className="notification-panel-loading">
              <CardSkeleton lines={2} />
              <CardSkeleton lines={2} />
              <CardSkeleton lines={2} />
            </div>
          ) : notifications.length ? (
            <ul className="notification-panel-list">
              {notifications.map((item) => (
                <li key={item.id} className={item.read ? "is-read" : ""}>
                  <button type="button" onClick={() => openNotification(item)} disabled={!item.actionUrl && item.read}>
                    {!item.read && <span className="notification-panel-dot" aria-hidden="true" />}
                    <span className="notification-panel-item-body">
                      <strong>{item.title}</strong>
                      <span>{item.message}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="notification-panel-empty">
              <Bell size={28} strokeWidth={1.6} />
              <p>No notifications yet</p>
              <span>Course updates and reminders will appear here.</span>
            </div>
          )}
        </div>

        <footer className="notification-panel-footer">
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push("/profile-preferences");
            }}
          >
            Manage preferences -&gt;
          </button>
        </footer>
      </aside>
    </div>
  );
}
