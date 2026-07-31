"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const globalRoutes = new Map([
  ["learning home", "/learning"],
  ["my learning", "/my-learning"],
  ["explore", "/explore"],
  ["explore courses", "/explore"],
  ["achievements", "/achievements"],
  ["certificates", "/certificates"],
  ["progress", "/progress"],
  ["nirjhar profile", "/profile-preferences"],
  ["view progress", "/progress"],
  ["view certificates", "/certificates"],
  ["view certificates ->", "/certificates"],
  ["verify credential", "/verify-credential"],
  ["verify credential ->", "/verify-credential"],
  ["view certificate", "/certificate-detail"],
  ["view certificate ->", "/certificate-detail"],
  ["open public record", "/verify-credential"],
  ["open public record ->", "/verify-credential"],
  ["download certificate", "/certificate-detail"],
  ["download certificate ->", "/certificate-detail"],
  ["download pdf", "/certificate-detail"],
  ["manage preferences", "/profile-preferences"],
  ["manage preferences ->", "/profile-preferences"],
  ["security settings", "/recover-access"],
  ["security settings ->", "/recover-access"],
  ["contact support", "/help-support"],
  ["contact support ->", "/help-support"],
  ["search help centre", "/help-support"],
  ["search help centre ->", "/help-support"],
  ["help centre", "/help-support"],
]);

const pageRoutes: Record<string, Record<string, string>> = {
  "/": {
    continue: "/onboarding",
    "continue with google": "/onboarding",
  },
  "/onboarding": {
    exit: "/learning",
    "open my dashboard": "/learning",
    "view all courses": "/explore",
    "view course": "/course",
  },
  "/learning": {
    continue: "/course",
    "continue ->": "/course",
    "mandatory learning": "/mandatory-learning",
    "upcoming checkpoints": "/learning-calendar",
    "view certificates ->": "/certificates",
  },
  "/my-learning": {
    "continue learning": "/course",
    "continue learning ->": "/course",
    "view details": "/course",
    "view details ->": "/course",
  },
  "/my-learning-empty": {
    "explore courses": "/explore",
    "explore courses ->": "/explore",
    "view": "/course",
    "view ->": "/course",
    "learn more": "/help-support",
    "learn more ->": "/help-support",
  },
  "/explore": {
    "browse collection": "/category/business-management",
    "browse collection ->": "/category/business-management",
    "view course": "/course",
    "view course ->": "/course",
    "open path": "/path/project-management",
    "open path ->": "/path/project-management",
  },
  "/search-results": {
    "view": "/course",
    "view ->": "/course",
    "compare results": "/category/business-management",
    "compare results ->": "/category/business-management",
    "clear filters": "/explore",
    "clear filters ->": "/explore",
  },
  "/category/business-management": {
    "explore collection": "/explore",
    "explore collection ->": "/explore",
    "view": "/course",
    "view ->": "/course",
    "follow category": "/my-learning",
    "follow category ->": "/my-learning",
  },
  "/path/project-management": {
    "start path": "/course",
    begin: "/course",
    "begin ->": "/course",
    "view full path": "/course",
    "view full path ->": "/course",
    "view requirements": "/certificate-progress",
    "view requirements ->": "/certificate-progress",
  },
  "/course": {
    "continue learning": "/lesson",
    "continue learning ->": "/lesson",
    "continue": "/lesson",
    "continue ->": "/lesson",
    review: "/reading-lesson",
    "view certificate requirements": "/certificate-progress",
    "view certificate requirements ->": "/certificate-progress",
    syllabus: "/course",
    resources: "/notes-bookmarks",
    discussion: "/course-discussion",
  },
  "/lesson": {
    "exit lesson": "/course",
    overview: "/lesson",
    notes: "/notes-bookmarks",
    discussion: "/course-discussion",
    assignment: "/assignment-submission",
    "mark complete": "/quiz",
  },
  "/reading-lesson": {
    "continue reading": "/lesson",
    "continue reading ->": "/lesson",
    read: "/lesson",
    "read ->": "/lesson",
  },
  "/notes-bookmarks": {
    "open saved items": "/lesson",
    "open saved items ->": "/lesson",
    open: "/lesson",
    "open ->": "/lesson",
    export: "/lesson",
    "export ->": "/lesson",
  },
  "/course-discussion": {
    "join discussion": "/course-discussion",
    "join discussion ->": "/course-discussion",
    open: "/course-discussion",
    "open ->": "/course-discussion",
    "read guidelines": "/help-support",
    "read guidelines ->": "/help-support",
  },
  "/assignment-submission": {
    "open assignment": "/assignment-submission",
    "open assignment ->": "/assignment-submission",
    upload: "/assignment-submission",
    "upload ->": "/assignment-submission",
    "view rubric": "/assignment-submission",
    "view rubric ->": "/assignment-submission",
  },
  "/quiz": {
    "exit quiz": "/course",
    previous: "/quiz",
    "save & continue": "/quiz-review",
    "save & continue ->": "/quiz-review",
    next: "/quiz-review",
    "review & submit": "/quiz-review",
  },
  "/quiz-review": {
    "exit quiz": "/course",
    "answered edit": "/quiz",
    "answered edit ->": "/quiz",
    "back to questions": "/quiz",
    "submit assessment": "/quiz-submit",
  },
  "/quiz-submit": {
    "exit quiz": "/course",
    "keep reviewing": "/quiz-review",
    "submit now": "/quiz-result",
  },
  "/quiz-result": {
    "exit quiz": "/course",
    "review answers": "/quiz-review",
    "continue to module 4": "/certificate-progress",
  },
  "/quiz-result-retake-required": {
    "start retake": "/quiz",
    "review attempt": "/quiz-review",
    "review attempt ->": "/quiz-review",
    review: "/quiz-review",
    "review ->": "/quiz-review",
    "view rules": "/mandatory-learning",
    "view rules ->": "/mandatory-learning",
  },
  "/certificate-progress": {
    "exit quiz": "/course",
    "continue course": "/course",
    "certificate of completion": "/certificate-detail",
  },
  "/certificates": {
    open: "/certificate-detail",
    "open ->": "/certificate-detail",
    "manage visibility": "/profile-preferences",
    "manage visibility ->": "/profile-preferences",
  },
  "/certificate-detail": {
    share: "/certificate-detail",
    "share ->": "/certificate-detail",
    copy: "/certificate-detail",
    "copy ->": "/certificate-detail",
    download: "/certificate-detail",
    "download ->": "/certificate-detail",
  },
  "/verify-credential": {
    confirmed: "/certificate-detail",
    "confirmed ->": "/certificate-detail",
    "report issue": "/help-support",
    "report issue ->": "/help-support",
  },
  "/mandatory-learning": {
    "view policy": "/help-support",
    "continue required course": "/lesson",
    "continue required course ->": "/lesson",
    start: "/lesson",
    "start ->": "/lesson",
    continue: "/lesson",
    "continue ->": "/lesson",
    review: "/reading-lesson",
    "review ->": "/reading-lesson",
    "see deadlines": "/learning-calendar",
    "see deadlines ->": "/learning-calendar",
  },
  "/learning-calendar": {
    open: "/course",
    "open ->": "/course",
    view: "/course",
    "view ->": "/course",
  },
  "/notifications": {
    "open course": "/course",
    "open course ->": "/course",
    download: "/certificates",
    "download ->": "/certificates",
    view: "/explore",
    "view ->": "/explore",
    "review deadline": "/learning-calendar",
    "review deadline ->": "/learning-calendar",
  },
  "/progress": {
    "view insights": "/achievements",
    "view insights ->": "/achievements",
    details: "/my-learning",
    "details ->": "/my-learning",
    "level details": "/achievements",
    "level details ->": "/achievements",
  },
  "/achievements": {
    "view level path": "/progress",
    "view level path ->": "/progress",
    share: "/certificates",
    "share ->": "/certificates",
    "view rules": "/progress",
    "view rules ->": "/progress",
  },
  "/profile-preferences": {
    "view public profile": "/achievements",
    "view public profile ->": "/achievements",
    update: "/onboarding",
    "update ->": "/onboarding",
    edit: "/profile-preferences",
    "edit ->": "/profile-preferences",
  },
  "/recover-access": {
    "begin recovery": "/recover-access",
    "begin recovery ->": "/recover-access",
    "use crew id": "/recover-access",
    continue: "/",
  },
  "/help-support": {
    open: "/recover-access",
    "open ->": "/recover-access",
    "view status": "/notifications",
    "view status ->": "/notifications",
  },
};

const partialRoutes = [
  ["mandatory learning", "/mandatory-learning"],
  ["upcoming checkpoints", "/learning-calendar"],
  ["recommended paths", "/path/project-management"],
  ["certificate of completion", "/certificate-detail"],
  ["project management foundations", "/course"],
  ["google project management", "/course"],
  ["content writing foundations", "/course"],
  ["communication mastery", "/course"],
  ["business management", "/category/business-management"],
  ["data protection", "/lesson"],
  ["code of conduct", "/reading-lesson"],
  ["client confidentiality", "/lesson"],
  ["checkpoint reminder", "/learning-calendar"],
  ["certificate ready", "/certificates"],
  ["new recommendation", "/explore"],
] as const;

function normalizeText(value: string) {
  return value
    .replace(/\u00e2\u2020\u2019|\u2192/g, "->")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function routeFor(pathname: string, label: string) {
  const current = pageRoutes[pathname]?.[label];

  if (current) {
    return current;
  }

  const global = globalRoutes.get(label);

  if (global) {
    return global;
  }

  return partialRoutes.find(([pattern]) => label.includes(pattern))?.[1];
}

export default function DemoNavigator() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      const element = event.target as Element | null;
      const target = element?.closest("button, a, [role='button']") as HTMLElement | null;

      if (element?.closest(".auth-form")) {
        return;
      }

      if (!target || target.hasAttribute("disabled") || target.getAttribute("aria-disabled") === "true") {
        return;
      }

      const label = normalizeText(
        target.getAttribute("aria-label") || target.textContent || "",
      );

      if (!label) {
        return;
      }

      const route = routeFor(pathname, label);

      if (!route || route === pathname) {
        return;
      }

      event.preventDefault();
      router.push(route);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter") {
        return;
      }

      const input = event.target as HTMLInputElement | null;
      const label = normalizeText(input?.getAttribute("aria-label") || input?.placeholder || "");

      if (input?.tagName === "INPUT" && label.includes("search")) {
        event.preventDefault();
        router.push("/search-results");
      }
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [pathname, router]);

  return null;
}
