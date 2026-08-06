"use client";

import { useEffect, useState } from "react";
import AdminGuard from "../components/AdminGuard";
import AdminSidebar from "../components/AdminSidebar";
import { CardSkeleton } from "../components/Skeleton";
import { getAuthSession, getCurrentUser, UserResponse } from "../lib/backendApi";
import { AuditLogResponse, getAuditLogs } from "../lib/adminApi";

const ENTITY_TYPES = ["ALL", "COURSE", "ACCOUNT", "VIDEO_RULES"] as const;

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AuditLogContent() {
  const [admin, setAdmin] = useState<UserResponse | null>(null);
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [entityType, setEntityType] = useState<(typeof ENTITY_TYPES)[number]>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const session = getAuthSession();
  const role = session?.role || "";

  useEffect(() => {
    getCurrentUser().then(setAdmin).catch(() => undefined);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getAuditLogs(0, 100, entityType === "ALL" ? undefined : entityType)
      .then((page) => {
        if (active) setLogs(page?.content || []);
      })
      .catch(() => setError("Could not load the audit log."))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [entityType]);

  return (
    <main className="admin-shell">
      <AdminSidebar activeHref="/audit-log" role={role} admin={admin} />

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">Ops Console</span>
            <h1>Audit log</h1>
            <p>A record of sensitive administrative actions across the platform.</p>
          </div>
        </header>

        {error && <div className="admin-error-banner">{error}</div>}

        <div className="admin-toolbar">
          <div className="admin-filter-pills">
            {ENTITY_TYPES.map((type) => (
              <button
                type="button"
                key={type}
                className={entityType === type ? "active" : ""}
                onClick={() => setEntityType(type)}
              >
                {type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        <section className="admin-panel admin-panel-wide">
          {loading ? (
            <CardSkeleton lines={5} />
          ) : logs.length ? (
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Actor</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>{formatDateTime(log.createdAt)}</td>
                      <td>{log.actorName || "Unknown"}</td>
                      <td>{log.action || "-"}</td>
                      <td>{log.entityType || "-"}</td>
                      <td>{log.details || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="admin-empty">No audit log entries yet.</p>
          )}
        </section>
      </section>
    </main>
  );
}

export default function AuditLogPage() {
  return (
    <AdminGuard>
      <AuditLogContent />
    </AdminGuard>
  );
}
