"use client";

import { Gauge, History, LayoutDashboard, ListChecks, LogOut, Menu, Settings, ShieldCheck, UserCog, UsersRound, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { logout, UserResponse } from "../lib/backendApi";
import { SUPER_ADMIN_ROLE } from "../lib/adminApi";

const ADMIN_ROOT = "/";
const ORGANIZATION_ADMIN_ROLE = "ORGANIZATION_ADMIN";

const baseNavItems = [
  { label: "Learners", href: "/learners", icon: UsersRound },
  { label: "Courses", href: "/courses", icon: LayoutDashboard },
  { label: "Quiz & Contests", href: "/quizzes", icon: ListChecks },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

function initials(name?: string | null) {
  const trimmed = (name || "").trim();
  if (!trimmed) return "A";
  return trimmed.charAt(0).toUpperCase();
}

export default function AdminSidebar({
  activeHref,
  role,
  admin,
}: {
  activeHref: string;
  role: string;
  admin?: UserResponse | null;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSuperAdmin = role === SUPER_ADMIN_ROLE;
  const isOrgAdmin = role === ORGANIZATION_ADMIN_ROLE;
  const navItems = useMemo(() => {
    const items: Array<{ label: string; href: string; icon: typeof Gauge }> = [];
    items.push({ label: "Dashboard", href: ADMIN_ROOT, icon: Gauge });
    items.push(...baseNavItems);
    if (isSuperAdmin || isOrgAdmin) items.push({ label: "Audit Log", href: "/audit-log", icon: History });
    if (isSuperAdmin) items.push({ label: "Admins", href: "/admins", icon: UserCog });
    return items;
  }, [isSuperAdmin, isOrgAdmin]);
  const adminName = admin?.fullName?.trim() || admin?.email?.split("@")[0] || "Admin";

  useEffect(() => {
    document.body.classList.toggle("admin-mobile-menu-open", mobileOpen);
    return () => document.body.classList.remove("admin-mobile-menu-open");
  }, [mobileOpen]);

  function handleSignOut() {
    setMobileOpen(false);
    logout();
  }

  return (
    <>
      <div className="admin-mobile-bar">
        <button
          type="button"
          className="admin-mobile-toggle"
          aria-expanded={mobileOpen}
          aria-controls="admin-mobile-nav"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((value) => !value)}
        >
          {mobileOpen ? <X size={20} strokeWidth={2.3} /> : <Menu size={20} strokeWidth={2.3} />}
        </button>
        <Link href={ADMIN_ROOT} className="admin-mobile-logo" aria-label="Ops Console home">
          <img src="/basecamp-logo.png" alt="BaseCamp" />
          <span>Ops Console</span>
        </Link>
        <div className="admin-mobile-avatar" aria-hidden="true">{initials(adminName)}</div>
      </div>

      {mobileOpen && (
        <button type="button" className="admin-mobile-backdrop" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
      )}

      <aside id="admin-mobile-nav" className={mobileOpen ? "admin-sidebar is-open" : "admin-sidebar"}>
        <div className="admin-sidebar-brand">
          <img src="/basecamp-logo.png" alt="BaseCamp" className="admin-sidebar-logo" />
          <span className="admin-sidebar-tag">Ops Console</span>
          <button type="button" className="admin-mobile-close" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
            <X size={18} strokeWidth={2.3} />
          </button>
        </div>

        <nav className="admin-nav" aria-label="Admin sections">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link href={href} className={activeHref === href ? "active" : ""} key={href} onClick={() => setMobileOpen(false)}>
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-role-note">
          <ShieldCheck size={16} strokeWidth={1.8} />
          <div>
            <strong>{isSuperAdmin ? "Super Admin" : "Admin"}</strong>
            <span>{isSuperAdmin ? "Full access, including role management" : "Courses, learners and quizzes"}</span>
          </div>
        </div>

        <div className="admin-profile">
          <div>{initials(adminName)}</div>
          <section>
            <strong>{adminName}</strong>
            <span>{role.replace(/_/g, " ")}</span>
          </section>
          <button type="button" onClick={handleSignOut} aria-label="Log out">
            <LogOut size={17} strokeWidth={1.8} />
          </button>
        </div>
      </aside>
    </>
  );
}
