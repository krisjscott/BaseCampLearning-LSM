"use client";

import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Circle, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "../components/AuthGuard";
import LearningSidebar from "../components/LearningSidebar";
import { CardSkeleton } from "../components/Skeleton";
import {
  EnrollmentResponse,
  PublicDashboardResponse,
  UserResponse,
  getCurrentUser,
  getMyEnrollments,
  getPublicDashboard,
} from "../lib/backendApi";
import { encodeId } from "../lib/idCodec";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

type DayCell = {
  date: Date;
  inMonth: boolean;
  key: string;
};

function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildMonthGrid(monthStart: Date): DayCell[] {
  const firstWeekday = monthStart.getDay();
  const gridStart = new Date(monthStart);
  gridStart.setDate(gridStart.getDate() - firstWeekday);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return {
      date,
      inMonth: date.getMonth() === monthStart.getMonth(),
      key: isoDate(date),
    };
  });
}

function formatMonth(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatShort(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function LearningCalendar() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [dashboard, setDashboard] = useState<PublicDashboardResponse | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getCurrentUser(), getPublicDashboard()]).then(([userResult, dashboardResult]) => {
      if (!active) return;
      const currentUser = userResult.status === "fulfilled" ? userResult.value : null;
      if (currentUser) setUser(currentUser);
      setDashboard(dashboardResult.status === "fulfilled" ? dashboardResult.value : null);

      if (currentUser) {
        getMyEnrollments(currentUser.id)
          .then((rows) => active && setEnrollments(rows))
          .catch(() => undefined)
          .finally(() => active && setLoading(false));
      } else {
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const todayKey = isoDate(new Date());
  const grid = useMemo(() => buildMonthGrid(monthCursor), [monthCursor]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, Array<{ enrollment: EnrollmentResponse; kind: "due" | "started" | "completed" }>>();
    const add = (key: string | null | undefined, enrollment: EnrollmentResponse, kind: "due" | "started" | "completed") => {
      if (!key) return;
      const day = key.slice(0, 10);
      const list = map.get(day) || [];
      list.push({ enrollment, kind });
      map.set(day, list);
    };
    enrollments.forEach((enrollment) => {
      add(enrollment.dueDate, enrollment, "due");
      add(enrollment.completedDate, enrollment, "completed");
      if (!enrollment.completedDate) add(enrollment.enrolledDate, enrollment, "started");
    });
    return map;
  }, [enrollments]);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return enrollments
      .filter((item) => item.dueDate && new Date(item.dueDate).getTime() >= now - 86400000 && item.status !== "COMPLETED")
      .sort((a, b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime())
      .slice(0, 6);
  }, [enrollments]);

  const selectedEvents = selectedDay ? eventsByDay.get(selectedDay) || [] : [];

  function goToMonth(offset: number) {
    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    setSelectedDay(null);
  }

  return (
    <main className="calendar-page">
      <LearningSidebar activeHref="/learning" dashboard={dashboard} loading={loading} user={user} />

      <section className="calendar-main">
        <header className="calendar-header">
          <div>
            <h1>Learning Calendar</h1>
            <p>Checkpoints, deadlines and enrollment activity from your account.</p>
          </div>
        </header>

        {loading ? (
          <CardSkeleton lines={8} />
        ) : (
          <div className="calendar-content-grid">
            <section className="calendar-grid-card">
              <div className="calendar-month-nav">
                <button type="button" onClick={() => goToMonth(-1)} aria-label="Previous month">
                  <ChevronLeft size={18} strokeWidth={2} />
                </button>
                <h2>{formatMonth(monthCursor)}</h2>
                <button type="button" onClick={() => goToMonth(1)} aria-label="Next month">
                  <ChevronRight size={18} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  className="calendar-today-btn"
                  onClick={() => {
                    const now = new Date();
                    setMonthCursor(new Date(now.getFullYear(), now.getMonth(), 1));
                    setSelectedDay(todayKey);
                  }}
                >
                  Today
                </button>
              </div>

              <div className="calendar-weekday-row">
                {weekdayLabels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>

              <div className="calendar-day-grid">
                {grid.map((cell) => {
                  const events = eventsByDay.get(cell.key) || [];
                  const isToday = cell.key === todayKey;
                  const isSelected = cell.key === selectedDay;
                  return (
                    <button
                      type="button"
                      key={cell.key}
                      className={[
                        "calendar-day-cell",
                        cell.inMonth ? "" : "is-outside",
                        isToday ? "is-today" : "",
                        isSelected ? "is-selected" : "",
                        events.length ? "has-events" : "",
                      ].filter(Boolean).join(" ")}
                      onClick={() => setSelectedDay(cell.key)}
                    >
                      <span className="calendar-day-number">{cell.date.getDate()}</span>
                      {events.length > 0 && (
                        <span className="calendar-day-dots" aria-hidden="true">
                          {events.slice(0, 3).map((event, index) => (
                            <span key={index} className={`calendar-dot is-${event.kind}`} />
                          ))}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedDay && (
                <div className="calendar-selected-day">
                  <h3>{new Date(selectedDay).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</h3>
                  {selectedEvents.length ? (
                    <ul>
                      {selectedEvents.map((event, index) => (
                        <li key={index}>
                          {event.kind === "due" && <CalendarDays size={15} strokeWidth={2} />}
                          {event.kind === "started" && <Play size={15} strokeWidth={2} />}
                          {event.kind === "completed" && <CheckCircle2 size={15} strokeWidth={2} />}
                          <span>
                            {event.kind === "due" ? "Due: " : event.kind === "completed" ? "Completed: " : "Started: "}
                            {event.enrollment.courseTitle || "Course"}
                          </span>
                          <button type="button" onClick={() => router.push(`/course?courseId=${encodeId(event.enrollment.courseId)}`)}>
                            Open -&gt;
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Nothing scheduled on this day.</p>
                  )}
                </div>
              )}
            </section>

            <aside className="calendar-agenda-card">
              <h2>Upcoming deadlines</h2>
              {upcoming.length ? (
                <ul className="calendar-agenda-list">
                  {upcoming.map((item) => (
                    <li key={item.id}>
                      <div>
                        <strong>{item.courseTitle || "Course"}</strong>
                        <span>{formatShort(item.dueDate)}</span>
                      </div>
                      <button type="button" onClick={() => router.push(`/course?courseId=${encodeId(item.courseId)}`)}>
                        Open -&gt;
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="calendar-agenda-empty">
                  <Circle size={22} strokeWidth={1.6} />
                  <p>No upcoming deadlines</p>
                  <span>Enroll in a course to see checkpoints here.</span>
                  <button type="button" onClick={() => router.push("/my-learning")}>Go to My Learning -&gt;</button>
                </div>
              )}
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

export default function LearningCalendarPage() {
  return (
    <AuthGuard>
      <LearningCalendar />
    </AuthGuard>
  );
}
