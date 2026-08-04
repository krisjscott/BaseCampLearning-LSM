"use client";

import {
  Award,
  BarChart3,
  BookOpen,
  Compass,
  Home,
  LogOut,
  Trophy,
  UserCheck,
} from "lucide-react";
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
import { CardSkeleton, SidebarSkeleton } from "../components/Skeleton";

const navItems = [
  ["Learning Home", Home, true],
  ["My Learning", BookOpen, false],
  ["Explore", Compass, false],
  ["Achievements", Trophy, false],
  ["Certificates", Award, false],
  ["Progress", BarChart3, false],
] as const;

const settings = [
  ["Personal information", "Name, photo and profile summary", "Edit"],
  ["Learning interests", "Project management, content and design", "Update"],
  ["Language & accessibility", "English", "Manage"],
] as const;

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

    try {
      const [updatedUser, updatedSettings] = await Promise.all([
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
      if (updatedUser) setUser(updatedUser);
      if (updatedSettings) setSettingsState(updatedSettings);
      setStatus("Saved to backend");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save profile");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    await logout();
  }

  const name = displayName(user);
  const initial = name.charAt(0).toUpperCase();
  const progressRows = (dashboard?.continueLearning || []).slice(0, 3).map((item) => [
    item.courseTitle,
    `${Math.round(item.completionPercentage || 0)}%`,
  ] as const);
  const statRows = useMemo(() => {
    const activeCourses = dashboard?.continueLearning?.length || 0;
    return [
      [String(activeCourses), "Saved courses"],
      [String(activeCourses), "Active courses"],
      ["Public", "Profile visibility"],
    ] as const;
  }, [dashboard]);
  const settingsRows = useMemo(() => {
    if (!user) return settings;
    return [
      ["Personal information", user.email || "Name, photo and profile summary", "Saved to backend"] as const,
      ["Learning interests", form.bio || "Add a short learning focus", "Saved to backend"] as const,
      ["Language & accessibility", `${form.language.toUpperCase()} - ${form.timezone}`, "Saved to backend"] as const,
    ];
  }, [form.bio, form.language, form.timezone, user]);

  return (
    <main className="certificate-detail-page profile-preferences-page">
      <aside className="learning-sidebar">
        <img src="/basecamp-logo.png" alt="BaseCamp" className="learning-sidebar-logo" />

        <nav className="learning-nav" aria-label="Learning sections">
          {navItems.map(([label, Icon, active]) => (
            <a
              href={({
                "Learning Home": "/learning",
                "My Learning": "/my-learning",
                Explore: "/explore",
                Achievements: "/achievements",
                Certificates: "/certificates",
                Progress: "/progress",
              } as const)[label]}
              className={active ? "active" : ""}
              key={label}
            >
              <Icon size={22} strokeWidth={1.8} />
              <span>{label}</span>
            </a>
          ))}
        </nav>

        <section className="recent-trails" aria-label="Recent trails">
          <p>Recent trails</p>
          {loading ? <SidebarSkeleton /> : progressRows.length ? progressRows.map(([trailName, progress]) => (
            <div key={trailName}>
              <span>{trailName}</span>
              <strong>{progress}</strong>
            </div>
          )) : <small>No course progress yet</small>}
        </section>
        <section className="learner-profile" aria-label="Learner profile">
          <div>{initial}</div>
          <section>
            <strong>{name}</strong>
            <span>{user?.role || "Learner"}</span>
            <small>{user?.learnerCode || "Profile code pending"}</small>
          </section>
        </section>
      </aside>

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
              <p>{user?.email || "Account email unavailable"} - {user?.learnerCode || "Profile code pending"} - {form.phone || "Phone not added"}</p>
              <button type="button">View public profile -&gt;</button>
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
            {loading ? Array.from({ length: 3 }, (_, index) => (
              <CardSkeleton key={index} lines={2} />
            )) : settingsRows.map(([title, description, action]) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>
                    {title === "Language & accessibility" ? (
                      <>English - Captions enabled</>
                    ) : (
                      description
                    )}
                  </p>
                </div>
                <button type="button">{action} -&gt;</button>
              </article>
            ))}
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
