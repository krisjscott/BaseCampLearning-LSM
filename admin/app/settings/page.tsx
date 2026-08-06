"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import AdminGuard from "../components/AdminGuard";
import AdminSidebar from "../components/AdminSidebar";
import { CardSkeleton } from "../components/Skeleton";
import { getAuthSession, getCurrentUser, UserResponse } from "../lib/backendApi";
import { getVideoRules, updateVideoRules } from "../lib/adminApi";

type FormState = {
  allowedFormats: string;
  allowedCodecs: string;
  maxFileSizeBytes: string;
  maxDurationMinutes: string;
  defaultEncodingProfile: string;
  requireTranscoding: boolean;
  autoGenerateThumbnails: boolean;
};

const emptyForm: FormState = {
  allowedFormats: "",
  allowedCodecs: "",
  maxFileSizeBytes: "",
  maxDurationMinutes: "",
  defaultEncodingProfile: "",
  requireTranscoding: true,
  autoGenerateThumbnails: true,
};

function bytesToMb(bytes?: number | null) {
  if (!bytes) return "";
  return String(Math.round(bytes / (1024 * 1024)));
}

function SettingsContent() {
  const [admin, setAdmin] = useState<UserResponse | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const session = getAuthSession();
  const role = session?.role || "";

  useEffect(() => {
    getCurrentUser().then(setAdmin).catch(() => undefined);
    getVideoRules()
      .then((rules) => {
        if (!rules) return;
        setForm({
          allowedFormats: (rules.allowedFormats || []).join(", "),
          allowedCodecs: (rules.allowedCodecs || []).join(", "),
          maxFileSizeBytes: bytesToMb(rules.maxFileSizeBytes),
          maxDurationMinutes: rules.maxDurationMinutes != null ? String(rules.maxDurationMinutes) : "",
          defaultEncodingProfile: rules.defaultEncodingProfile || "",
          requireTranscoding: rules.requireTranscoding ?? true,
          autoGenerateThumbnails: rules.autoGenerateThumbnails ?? true,
        });
      })
      .catch(() => setError("Could not load video rules."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateVideoRules({
        allowedFormats: form.allowedFormats.split(",").map((v) => v.trim()).filter(Boolean),
        allowedCodecs: form.allowedCodecs.split(",").map((v) => v.trim()).filter(Boolean),
        maxFileSizeBytes: Math.max(1, Number(form.maxFileSizeBytes) || 0) * 1024 * 1024,
        maxDurationMinutes: form.maxDurationMinutes ? Number(form.maxDurationMinutes) : undefined,
        defaultEncodingProfile: form.defaultEncodingProfile || undefined,
        requireTranscoding: form.requireTranscoding,
        autoGenerateThumbnails: form.autoGenerateThumbnails,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save video rules.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="admin-shell">
      <AdminSidebar activeHref="/settings" role={role} admin={admin} />

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">Ops Console</span>
            <h1>Settings</h1>
            <p>Platform-wide rules for uploaded lesson videos.</p>
          </div>
        </header>

        {error && <div className="admin-error-banner">{error}</div>}
        {saved && !error && <div className="admin-success-banner">Video rules saved.</div>}

        <section className="admin-panel admin-panel-wide">
          {loading ? (
            <CardSkeleton lines={5} />
          ) : (
            <div className="admin-form-grid">
              <label>
                <span>Allowed formats (comma separated)</span>
                <input
                  type="text"
                  placeholder="MP4, MOV, AVI"
                  value={form.allowedFormats}
                  onChange={(event) => setForm((prev) => ({ ...prev, allowedFormats: event.target.value }))}
                />
              </label>
              <label>
                <span>Allowed codecs (comma separated)</span>
                <input
                  type="text"
                  placeholder="H264, H265"
                  value={form.allowedCodecs}
                  onChange={(event) => setForm((prev) => ({ ...prev, allowedCodecs: event.target.value }))}
                />
              </label>
              <label>
                <span>Max file size (MB)</span>
                <input
                  type="number"
                  value={form.maxFileSizeBytes}
                  onChange={(event) => setForm((prev) => ({ ...prev, maxFileSizeBytes: event.target.value }))}
                />
              </label>
              <label>
                <span>Max duration (minutes)</span>
                <input
                  type="number"
                  value={form.maxDurationMinutes}
                  onChange={(event) => setForm((prev) => ({ ...prev, maxDurationMinutes: event.target.value }))}
                />
              </label>
              <label className="admin-form-span-2">
                <span>Default encoding profile</span>
                <input
                  type="text"
                  placeholder="STANDARD"
                  value={form.defaultEncodingProfile}
                  onChange={(event) => setForm((prev) => ({ ...prev, defaultEncodingProfile: event.target.value }))}
                />
              </label>
              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  checked={form.requireTranscoding}
                  onChange={(event) => setForm((prev) => ({ ...prev, requireTranscoding: event.target.checked }))}
                />
                <span>Require transcoding on upload</span>
              </label>
              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  checked={form.autoGenerateThumbnails}
                  onChange={(event) => setForm((prev) => ({ ...prev, autoGenerateThumbnails: event.target.checked }))}
                />
                <span>Auto-generate thumbnails</span>
              </label>

              <div className="admin-form-span-2">
                <button type="button" className="admin-primary-btn" onClick={handleSave} disabled={saving}>
                  <Save size={16} strokeWidth={2} /> {saving ? "Saving..." : "Save video rules"}
                </button>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default function SettingsPage() {
  return (
    <AdminGuard>
      <SettingsContent />
    </AdminGuard>
  );
}
