"use client";

import { Award, BarChart3, BookOpen, Compass, Home, Trophy } from "lucide-react";
import Link from "next/link";
import { PublicDashboardResponse, UserResponse } from "../lib/backendApi";
import { getLevelProgress } from "../lib/levelProgress";
import { SidebarSkeleton, Skeleton } from "./Skeleton";

const navItems = [
  { label: "Learning Home", href: "/learning", icon: Home },
  { label: "My Learning", href: "/my-learning", icon: BookOpen },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Achievements", href: "/achievements", icon: Trophy },
  { label: "Certificates", href: "/certificates", icon: Award },
  { label: "Progress", href: "/progress", icon: BarChart3 },
] as const;

function firstName(user?: UserResponse | null) {
  return user?.fullName?.trim().split(/\s+/)[0] || user?.email?.split("@")[0] || "Learner";
}

export default function LearningSidebar({
  activeHref,
  dashboard,
  loading,
  user,
}: {
  activeHref: string;
  dashboard?: PublicDashboardResponse | null;
  loading: boolean;
  user?: UserResponse | null;
}) {
  const learnerName = firstName(user);
  const xpPoints = Math.max(0, Math.round(dashboard?.xpPoints || 0));
  const level = getLevelProgress(xpPoints);
  const trails = (dashboard?.continueLearning || []).slice(0, 3).map((item) => ({
    id: item.courseId,
    title: item.courseTitle,
    progress: `${Math.round(item.completionPercentage || 0)}%`,
  }));

  return (
    <aside className="learning-sidebar">
      <Link href="/learning" aria-label="BaseCamp learning home">
        <img src="/basecamp-logo.png" alt="BaseCamp" className="learning-sidebar-logo" />
      </Link>

      <nav className="learning-nav" aria-label="Learning sections">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link href={href} className={activeHref === href ? "active" : ""} key={href}>
            <Icon size={22} strokeWidth={1.8} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <section className="recent-trails" aria-label="Recent trails">
        <p>Recent trails</p>
        {loading ? (
          <SidebarSkeleton />
        ) : trails.length ? (
          trails.map(({ id, title, progress }) => (
            <div key={id}>
              <span>{title}</span>
              <strong>{progress}</strong>
            </div>
          ))
        ) : (
          <small>No course progress yet</small>
        )}
      </section>

      <Link href="/profile-preferences" className="learner-profile" aria-label="Open profile preferences">
        {loading ? (
          <>
            <div>
              <Skeleton className="skeleton-pill" />
            </div>
            <SidebarSkeleton />
          </>
        ) : (
          <>
            <div>{learnerName.charAt(0).toUpperCase()}</div>
            <section>
              <strong>{learnerName}</strong>
              <span>{level.current.name} - {xpPoints.toLocaleString()} XP</span>
              <small>{user?.learnerCode || "Profile code pending"}</small>
            </section>
          </>
        )}
      </Link>
    </aside>
  );
}
