"use client";

import { Award, BarChart3, Bell, BookOpen, Compass, Home, LogOut, Menu, Trophy, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getPublicDashboard, logout } from "../lib/backendApi";
import { Skeleton } from "./Skeleton";

const navItems = [
  { label: "Learning Home", href: "/learning", icon: Home },
  { label: "My Learning", href: "/my-learning", icon: BookOpen },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Achievements", href: "/achievements", icon: Trophy },
  { label: "Certificates", href: "/certificates", icon: Award },
  { label: "Progress", href: "/progress", icon: BarChart3 },
] as const;

const learningRoutes = [
  "/learning",
  "/my-learning",
  "/my-learning-empty",
  "/explore",
  "/search-results",
  "/mandatory-learning",
  "/learning-calendar",
  "/notifications",
  "/progress",
  "/achievements",
  "/certificates",
  "/certificate-detail",
  "/course",
  "/course-discussion",
  "/path/project-management",
  "/category/business-management",
  "/profile-preferences",
  "/help-support",
  "/recover-access",
  "/verify-credential",
  "/assignment-submission",
  "/notes-bookmarks",
  "/reading-lesson",
  "/quiz-result-retake-required",
] as const;

function getActivePath(pathname: string) {
  if (pathname.startsWith("/my-learning")) return "/my-learning";
  if (pathname.startsWith("/explore") || pathname.startsWith("/search-results") || pathname.startsWith("/category") || pathname.startsWith("/path")) return "/explore";
  if (pathname.startsWith("/achievements")) return "/achievements";
  if (pathname.startsWith("/certificates") || pathname.startsWith("/certificate") || pathname.startsWith("/verify-credential")) return "/certificates";
  if (pathname.startsWith("/progress")) return "/progress";
  return "/learning";
}

export default function MobileHamburgerMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [activeCourses, setActiveCourses] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const shouldShow = learningRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const activePath = getActivePath(pathname);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", open);
    return () => document.body.classList.remove("mobile-menu-open");
  }, [open]);

  useEffect(() => {
    let active = true;
    setLoadingStatus(true);
    getPublicDashboard()
      .then((dashboard) => {
        if (active) setActiveCourses(dashboard?.continueLearning?.length || 0);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoadingStatus(false);
      });
    return () => {
      active = false;
    };
  }, [pathname]);

  if (!shouldShow) return null;

  async function handleSignOut() {
    setSigningOut(true);
    await logout();
  }

  return (
    <section className="mobile-hamburger-shell" aria-label="Mobile navigation">
      <div className="mobile-hamburger-bar">
        <button type="button" aria-expanded={open} aria-controls="mobile-learning-menu" onClick={() => setOpen((value) => !value)}>
          {open ? <X size={22} strokeWidth={2.4} /> : <Menu size={22} strokeWidth={2.4} />}
          <span>Menu</span>
        </button>
        <Link href="/learning" className="mobile-hamburger-logo" aria-label="BaseCamp learning home">
          <img src="/basecamp-logo.png" alt="BaseCamp" />
        </Link>
        <div className="mobile-hamburger-actions" aria-label="Learning status">
          <button type="button" className="mobile-xp-pill" aria-label="Current XP">
            <img src="/xp-star.svg" alt="" aria-hidden="true" />
            {loadingStatus ? <Skeleton className="skeleton-pill" /> : <span>{activeCourses} active</span>}
          </button>
          <Link href="/notifications" className="mobile-notification-button" aria-label="Notifications">
            <Bell size={19} strokeWidth={1.95} />
          </Link>
        </div>
      </div>

      {open && <button type="button" className="mobile-menu-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />}

      <nav id="mobile-learning-menu" className={open ? "mobile-menu-panel open" : "mobile-menu-panel"} aria-label="Learning sections">
        <div className="mobile-menu-panel-header">
          <span>Navigate BaseCamp</span>
          <button type="button" aria-label="Close menu" onClick={() => setOpen(false)}>
            <X size={20} strokeWidth={2.4} />
          </button>
        </div>
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link href={href} className={activePath === href ? "active" : ""} key={href}>
            <Icon size={20} strokeWidth={1.9} />
            <span>{label}</span>
          </Link>
        ))}
        <button type="button" className="mobile-menu-signout" onClick={handleSignOut} disabled={signingOut}>
          <LogOut size={20} strokeWidth={1.9} />
          <span>{signingOut ? "Signing out..." : "Sign out"}</span>
        </button>
      </nav>
    </section>
  );
}
