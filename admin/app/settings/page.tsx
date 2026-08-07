"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminGuard from "../components/AdminGuard";
import AdminSidebar from "../components/AdminSidebar";
import { CardSkeleton } from "../components/Skeleton";
import { clearAuthSession, getAuthSession, getCurrentUser, UserResponse } from "../lib/backendApi";
import { getVideoRules, updateVideoRules } from "../lib/adminApi";
import { changePassword } from "../lib/backendApi";

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
  const router = useRouter();
  const [admin, setAdmin] = useState<UserResponse | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordStatus, setPasswordStatus] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

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

  async function handleChangePassword() {
    setPasswordStatus("");
    if (passwordForm.newPassword.length < 8) return setPasswordStatus("New password must be at least 8 characters.");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return setPasswordStatus("Passwords do not match.");
    setChangingPassword(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordStatus("Password changed. Signing you out...");
      // The backend revokes the refresh token on password change, but the current
      // access token still works until it naturally expires - clear it here so this
      // browser tab actually stops being an authenticated session, matching what the
      // message tells the admin just happened.
      window.setTimeout(() => {
        clearAuthSession();
        router.push("/login");
      }, 1200);
    } catch (err) {
      setPasswordStatus(err instanceof Error ? err.message : "Could not change password.");
    } finally {
      setChangingPassword(false);
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

        <section className="admin-panel admin-panel-wide">
          <div className="admin-panel-heading"><div><h2>Account security</h2></div></div>
          <div className="admin-form-grid">
            <label><span>Current password</span><input type="password" autoComplete="current-password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} /></label>
            <label><span>New password</span><input type="password" autoComplete="new-password" minLength={8} value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} /></label>
            <label><span>Confirm new password</span><input type="password" autoComplete="new-password" minLength={8} value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} /></label>
            {passwordStatus && <p className="admin-form-span-2 admin-panel-caption">{passwordStatus}</p>}
            <div><button type="button" className="admin-primary-btn" onClick={handleChangePassword} disabled={changingPassword}>{changingPassword ? "Changing..." : "Change password"}</button></div>
          </div>
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
