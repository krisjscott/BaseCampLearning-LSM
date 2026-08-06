"use client";

import { IdCard, LogOut, Mail, Phone, UserCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  PublicDashboardResponse,
  UserResponse,
  UserSettingsResponse,
  getCurrentUser,
  getCurrentUserSettings,
  getPublicDashboard,
  logout,
  updateCurrentUser,
  updateCurrentUserSettings,
} from "../lib/backendApi";
import AuthGuard from "../components/AuthGuard";
import LearningSidebar from "../components/LearningSidebar";
import { CardSkeleton } from "../components/Skeleton";

function displayName(user: UserResponse | null) {
  return user?.fullName || user?.email?.split("@")[0] || "Learner";
}

function ProfilePreferencesDesktop() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [settingsState, setSettingsState] = useState<UserSettingsResponse | null>(null);
  const [dashboard, setDashboard] = useState<PublicDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    bio: "",
    address: "",
    language: "en",
    timezone: "Asia/Kolkata",
    emailNotifications: true,
    pushNotifications: true,
  });
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getCurrentUser(), getCurrentUserSettings(), getPublicDashboard()])
      .then(([userResult, settingsResult, dashboardResult]) => {
        if (!active) return;
        const nextUser = userResult.status === "fulfilled" ? userResult.value : null;
        const nextSettings = settingsResult.status === "fulfilled" ? settingsResult.value : null;
        const nextDashboard = dashboardResult.status === "fulfilled" ? dashboardResult.value : null;

        if (nextUser) {
          setUser(nextUser);
        }
        if (nextSettings) {
          setSettingsState(nextSettings);
        }
        setDashboard(nextDashboard);

        setForm((current) => ({
          ...current,
          fullName: nextUser?.fullName || "",
          phone: nextUser?.phone || "",
          bio: nextUser?.bio || "",
          address: nextUser?.address || "",
          language: nextSettings?.language || "en",
          timezone: nextSettings?.timezone || "Asia/Kolkata",
          emailNotifications: nextSettings?.emailNotifications ?? true,
          pushNotifications: nextSettings?.pushNotifications ?? true,
        }));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function saveProfile() {
    setIsSaving(true);
    setStatus("");

    // allSettled, not all: the profile fields and the settings fields save
    // through two independent backend calls - if one fails, the other
    // should still be reported as saved rather than the whole action
    // silently looking like it did nothing.
    const [profileResult, settingsResult] = await Promise.allSettled([
      updateCurrentUser({
        fullName: form.fullName,
        phone: form.phone,
        bio: form.bio,
        address: form.address,
      }),
      updateCurrentUserSettings({
        emailNotifications: form.emailNotifications,
        pushNotifications: form.pushNotifications,
        language: form.language,
        timezone: form.timezone,
      }),
    ]);

    if (profileResult.status === "fulfilled" && profileResult.value) setUser(profileResult.value);
    if (settingsResult.status === "fulfilled" && settingsResult.value) setSettingsState(settingsResult.value);

    if (profileResult.status === "fulfilled" && settingsResult.status === "fulfilled") {
      setStatus("Saved to backend");
    } else if (profileResult.status === "rejected" && settingsResult.status === "rejected") {
      setStatus("Could not save profile or preferences");
    } else if (profileResult.status === "rejected") {
      setStatus(profileResult.reason instanceof Error ? profileResult.reason.message : "Could not save profile details");
    } else {
      setStatus(settingsResult.status === "rejected" && settingsResult.reason instanceof Error ? settingsResult.reason.message : "Could not save preferences");
    }

    setIsSaving(false);
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    await logout();
  }

  const name = displayName(user);
  const statRows = useMemo(() => {
    const activeCourses = dashboard?.continueLearning?.length || 0;
    return [
      [String(activeCourses), "Saved courses"],
      [String(activeCourses), "Active courses"],
      ["Public", "Profile visibility"],
    ] as const;
  }, [dashboard]);

  return (
    <main className="certificate-detail-page profile-preferences-page">
      <LearningSidebar activeHref="/profile-preferences" dashboard={dashboard} loading={loading} user={user} />

      <section className="certificate-detail-main">
        <header className="certificate-detail-header">
          <div>
            <h1>Profile &amp; Preferences</h1>
            <p>Manage your learner identity and personalisation.</p>
          </div>
          <button type="button" onClick={saveProfile} disabled={isSaving}>
            <UserCheck size={18} />
            <span>{isSaving ? "Saving..." : "Save changes"}</span>
          </button>
        </header>

        <section className="certificate-detail-hero">
          {loading ? <CardSkeleton lines={3} /> : (
            <>
              <h2>{name}</h2>
              <div className="profile-identity-pills">
                <span><Mail size={13} />{user?.email || "Account email unavailable"}</span>
                <span><IdCard size={13} />{user?.learnerCode || "Profile code pending"}</span>
                <span><Phone size={13} />{form.phone || "Phone not added"}</span>
              </div>
            </>
          )}
        </section>

        <section className="certificate-detail-stats" aria-label="Profile summary">
          {loading ? Array.from({ length: 3 }, (_, index) => (
            <article key={index}>
              <CardSkeleton lines={2} />
            </article>
          )) : statRows.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </section>

        <h2 className="share-certificate-title">Profile settings</h2>

        <div className="certificate-detail-grid">
          <section className="certificate-share-list" aria-label="Profile settings">
            <article className="profile-form-card">
              {loading ? <CardSkeleton lines={8} /> : (
                <>
                  <div>
                    <h3>Profile details</h3>
                    <p>These fields load from and save to the production backend.</p>
                  </div>
                  <label>
                    Full name
                    <input
                      value={form.fullName}
                      onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                    />
                  </label>
                  <label>
                    Phone
                    <input
                      value={form.phone}
                      onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    />
                  </label>
                  <label>
                    Address
                    <input
                      value={form.address}
                      onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                    />
                  </label>
                  <label>
                    Learning focus
                    <textarea
                      value={form.bio}
                      onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                    />
                  </label>
                  <label>
                    Language
                    <select
                      value={form.language}
                      onChange={(event) => setForm((current) => ({ ...current, language: event.target.value }))}
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="bn">Bengali</option>
                    </select>
                  </label>
                  <label>
                    Timezone
                    <select
                      value={form.timezone}
                      onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))}
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York</option>
                    </select>
                  </label>
                  <label className="profile-toggle-row">
                    <input
                      type="checkbox"
                      checked={form.emailNotifications}
                      onChange={(event) => setForm((current) => ({ ...current, emailNotifications: event.target.checked }))}
                    />
                    Email notifications
                  </label>
                  <label className="profile-toggle-row">
                    <input
                      type="checkbox"
                      checked={form.pushNotifications}
                      onChange={(event) => setForm((current) => ({ ...current, pushNotifications: event.target.checked }))}
                    />
                    Push notifications
                  </label>
                  {status ? <p className="profile-save-status">{status}</p> : null}
                </>
              )}
            </article>
          </section>

          <aside className="verification-card">
            {loading ? <CardSkeleton lines={3} /> : (
              <>
                <h2>Account security</h2>
                <p>Email sign-in and Crew ID access are active. Sign out clears this browser session and notifies the backend.</p>
                <button type="button" className="secondary" onClick={handleSignOut} disabled={isSigningOut}>
                  <LogOut size={17} />
                  <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
                </button>
              </>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

export default function ProfilePreferencesPage() {
  return (
    <AuthGuard>
      <ProfilePreferencesDesktop />
    </AuthGuard>
  );
}
