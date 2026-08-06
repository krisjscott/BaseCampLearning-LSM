"use client";

import {
  Award,
  BookOpen,
  Check,
  ClipboardList,
  Clock,
  Grid2X2,
  GraduationCap,
  Layers,
  List,
  Lock,
  MessageCircle,
  Share2,
  Trophy,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "../components/AuthGuard";
import LearningSidebar from "../components/LearningSidebar";
import { CardSkeleton } from "../components/Skeleton";
import {
  AssessmentResponse,
  ContestResponse,
  CourseProgressResponse,
  CourseResponse,
  LeaderboardEntryResponse,
  ModuleResponse,
  PublicDashboardResponse,
  UserResponse,
  getActiveContests,
  getContestLeaderboard,
  getCourse,
  getCourseAssessments,
  getCourseModules,
  getCourseProgress,
  getCurrentUser,
  getPublicDashboard,
} from "../lib/backendApi";
import { decodeParam, encodeId } from "../lib/idCodec";

type Tab = "overview" | "content" | "grades" | "discussion";

function CourseOverview() {
  const router = useRouter();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [progress, setProgress] = useState<CourseProgressResponse | null>(null);
  const [assessments, setAssessments] = useState<AssessmentResponse[]>([]);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [dashboard, setDashboard] = useState<PublicDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("content");
  const [shareStatus, setShareStatus] = useState("");
  const [contests, setContests] = useState<ContestResponse[]>([]);
  const [expandedContestId, setExpandedContestId] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntryResponse[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const id = decodeParam(params, "courseId");
    setCourseId(id);
    const requestedTab = params.get("tab");
    if (requestedTab === "overview" || requestedTab === "content" || requestedTab === "grades") {
      setTab(requestedTab);
    }

    Promise.allSettled([getCurrentUser(), getPublicDashboard()]).then(([userResult, dashboardResult]) => {
      if (!active) return;
      if (userResult.status === "fulfilled") setUser(userResult.value);
      setDashboard(dashboardResult.status === "fulfilled" ? dashboardResult.value : null);
    });

    if (!id) {
      setLoading(false);
      return;
    }

    Promise.allSettled([getCourse(id), getCourseModules(id), getCourseAssessments(id), getActiveContests(id)])
      .then(([courseResult, modulesResult, assessmentsResult, contestsResult]) => {
        if (!active) return;
        setCourse(courseResult.status === "fulfilled" ? courseResult.value : null);
        setModules(modulesResult.status === "fulfilled" ? modulesResult.value : []);
        setAssessments(assessmentsResult.status === "fulfilled" ? assessmentsResult.value : []);
        setContests(contestsResult.status === "fulfilled" ? contestsResult.value : []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    getCurrentUser().then((currentUser) => {
      if (!active || !currentUser) return;
      getCourseProgress(id, currentUser.id)
        .then((value) => active && setProgress(value))
        .catch(() => undefined);
    });

    return () => {
      active = false;
    };
  }, []);

  const totalLessons = useMemo(() => modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0), [modules]);
  const completion = Math.round(progress?.completionPercentage || 0);

  function toggleLeaderboard(contestId: string) {
    if (expandedContestId === contestId) {
      setExpandedContestId(null);
      return;
    }
    setExpandedContestId(contestId);
    setLeaderboardLoading(true);
    getContestLeaderboard(contestId)
      .then(setLeaderboard)
      .catch(() => setLeaderboard([]))
      .finally(() => setLeaderboardLoading(false));
  }

  function lessonHref(lessonId: string, moduleId: string) {
    return `/lesson?lessonId=${encodeId(lessonId)}&moduleId=${encodeId(moduleId)}&courseId=${encodeId(courseId || "")}`;
  }

  function continueLearning() {
    if (progress?.lastLessonId) {
      const owningModule = modules.find((module) => module.lessons?.some((lesson) => lesson.id === progress.lastLessonId));
      router.push(owningModule ? lessonHref(progress.lastLessonId, owningModule.id) : `/lesson?lessonId=${encodeId(progress.lastLessonId)}`);
      return;
    }
    const firstModule = modules.find((module) => module.lessons?.length);
    const firstLesson = firstModule?.lessons?.[0];
    if (firstLesson && firstModule) {
      router.push(lessonHref(firstLesson.id, firstModule.id));
    }
  }

  async function shareCourse() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareStatus("Link copied");
    } catch {
      setShareStatus("Could not copy link");
    }
    setTimeout(() => setShareStatus(""), 2500);
  }

  if (!loading && !courseId) {
    return (
      <main className="course-overview">
        <LearningSidebar activeHref="/my-learning" dashboard={dashboard} loading={false} user={user} />
        <section className="course-main">
          <div className="course-hero-copy">
            <h1>No course selected</h1>
            <span>Open this page from a course card so we know which course to show.</span>
            <button type="button" className="quiz-primary empty-state-actions" onClick={() => router.push("/explore")}>
              Browse courses
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="course-overview">
      <LearningSidebar activeHref="/my-learning" dashboard={dashboard} loading={loading} user={user} />

      <section className="course-main">
        {loading ? (
          <CardSkeleton lines={10} />
        ) : !course ? (
          <div className="course-hero-copy">
            <h1>Course not found</h1>
            <span>This course may have been removed or archived.</span>
            <button type="button" className="quiz-primary empty-state-actions" onClick={() => router.push("/explore")}>
              Browse courses
            </button>
          </div>
        ) : (
          <>
            <header className="course-breadcrumb">
              <p>My Learning / {course.title}</p>
              <div>
                <button type="button" onClick={shareCourse}>
                  <Share2 size={16} />
                  <span>{shareStatus || "Share"}</span>
                </button>
              </div>
            </header>

            <section className="course-hero">
              <div className="course-hero-copy">
                <p>{course.categoryName || "BaseCamp course"}</p>
                <h1>{course.title}</h1>
                <span>{course.description || "No description provided for this course yet."}</span>
                <div className="course-facts">
                  <span><Layers size={13} />{modules.length} module{modules.length === 1 ? "" : "s"}</span>
                  <span><BookOpen size={13} />{totalLessons} lesson{totalLessons === 1 ? "" : "s"}</span>
                  <span><Clock size={13} />{course.durationHours ? `Approx. ${course.durationHours} hours` : "Self-paced"}</span>
                  <span><User size={13} />{course.instructorName || "BaseCamp instructor"}</span>
                </div>
              </div>

              <aside className="course-progress-card">
                <p>Your progress</p>
                <h2>{completion}% complete</h2>
                <div aria-label={`${completion} percent complete`} style={{ ["--course-progress-fill" as string]: `${completion}%` }}>
                  <span />
                </div>
                <span>
                  {completion >= 100
                    ? "You've completed this course!"
                    : progress?.lastLessonTitle
                      ? `Next: ${progress.lastLessonTitle}`
                      : "Not started yet"}
                </span>
                <button type="button" onClick={continueLearning} disabled={!totalLessons}>
                  <span>{completion >= 100 ? "Review course" : progress?.lastLessonId ? "Continue learning" : "Start learning"}</span>
                </button>
              </aside>
            </section>

            <nav className="course-tabs" aria-label="Course sections">
              <button type="button" className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>
                <Grid2X2 size={16} />
                <span>Overview</span>
              </button>
              <button type="button" className={tab === "content" ? "active" : ""} onClick={() => setTab("content")}>
                <List size={16} />
                <span>Course content</span>
              </button>
              <button type="button" className={tab === "grades" ? "active" : ""} onClick={() => setTab("grades")}>
                <GraduationCap size={16} />
                <span>Grades</span>
              </button>
              <button type="button" onClick={() => router.push(`/course-discussion?courseId=${encodeId(course.id)}`)}>
                <MessageCircle size={16} />
                <span>Discussion</span>
              </button>
            </nav>

            {tab === "overview" && (
              <div className="course-content-grid">
                <section className="module-panel">
                  <h2>About this course</h2>
                  <p>{course.description || "No description provided for this course yet."}</p>
                </section>
                <aside className="course-side-panel">
                  <section className="info-card">
                    <h2>Earn a verified certificate</h2>
                    <p>Complete all lessons and required quizzes to unlock a downloadable, shareable certificate.</p>
                    <button type="button" onClick={() => router.push("/certificates")}>
                      <Award size={16} />
                      <span>View your certificates -&gt;</span>
                    </button>
                  </section>
                </aside>
              </div>
            )}

            {tab === "content" && (
              <div className="course-content-grid">
                <section className="module-panel">
                  <h2>Course content</h2>
                  <p>{modules.length} modules - {totalLessons} lessons - {assessments.length} quizzes</p>

                  <div className="module-list">
                    {modules.length ? modules.map((module, index) => {
                      const firstLesson = module.lessons?.[0];
                      const isCurrent = progress?.lastLessonId && module.lessons?.some((lesson) => lesson.id === progress.lastLessonId);
                      return (
                        <article className="module-row" key={module.id}>
                          <div className={`module-status ${isCurrent ? "current" : ""}`}>
                            <span>{String(index + 1).padStart(2, "0")}</span>
                          </div>
                          <section>
                            <h3>{module.title}</h3>
                            <p>{module.lessons?.length || 0} lesson{module.lessons?.length === 1 ? "" : "s"}</p>
                          </section>
                          <button
                            type="button"
                            className={isCurrent ? "continue" : ""}
                            disabled={!firstLesson}
                            onClick={() => firstLesson && router.push(lessonHref(firstLesson.id, module.id))}
                          >
                            {firstLesson ? (isCurrent ? "Continue ->" : "Open") : <Lock size={17} />}
                          </button>
                        </article>
                      );
                    }) : (
                      <p className="admin-empty">No modules published for this course yet.</p>
                    )}
                  </div>
                </section>

                <aside className="course-side-panel">
                  <section className="info-card">
                    <h2>Earn a verified certificate</h2>
                    <p>Complete all lessons and required quizzes to unlock a downloadable, shareable certificate.</p>
                    <button type="button" onClick={() => router.push("/certificates")}>
                      <Award size={16} />
                      <span>View your certificates -&gt;</span>
                    </button>
                  </section>
                </aside>
              </div>
            )}

            {tab === "grades" && (
              <div className="course-content-grid">
                <section className="module-panel">
                  <h2>Quizzes and assessments</h2>
                  {assessments.length ? (
                    <div className="module-list">
                      {assessments.map((assessment) => (
                        <article className="module-row" key={assessment.id}>
                          <div className="module-status">
                            <ClipboardList size={18} />
                          </div>
                          <section>
                            <h3>{assessment.title}</h3>
                            <p>{assessment.type || "QUIZ"} - Pass score {assessment.passingScore ?? 0}%</p>
                          </section>
                          <button type="button" className="continue" onClick={() => router.push(`/quiz?assessmentId=${encodeId(assessment.id)}`)}>
                            Take quiz
                          </button>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="admin-empty">No quizzes have been published for this course yet.</p>
                  )}
                </section>

                <aside className="course-side-panel">
                  <section className="info-card">
                    <h2>Active contests</h2>
                    {contests.length ? (
                      <div className="module-list">
                        {contests.map((contest) => (
                          <div className="leaderboard-contest-group" key={contest.id}>
                            <article className="module-row contest-row">
                              <div className="module-status contest-badge">
                                <Trophy size={18} />
                              </div>
                              <section>
                                <h3>{contest.title}</h3>
                                <p>
                                  Ends{" "}
                                  {new Date(contest.endAt).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                              </section>
                              <button type="button" className="continue" onClick={() => toggleLeaderboard(contest.id)}>
                                {expandedContestId === contest.id ? "Hide" : "Leaderboard"}
                              </button>
                            </article>
                            {expandedContestId === contest.id && (
                              <div className="leaderboard-panel">
                                {leaderboardLoading ? (
                                  <CardSkeleton lines={3} />
                                ) : leaderboard.length ? (
                                  <ol className="leaderboard-list">
                                    {leaderboard.map((entry) => {
                                      const isYou = !!user && entry.userId === user.id;
                                      return (
                                        <li
                                          key={entry.userId}
                                          className={`leaderboard-row ${entry.rank <= 3 ? `rank-${entry.rank}` : ""} ${isYou ? "is-you" : ""}`}
                                        >
                                          <span className="leaderboard-rank">{entry.rank}</span>
                                          <span className="leaderboard-name">
                                            {entry.userName || "Learner"}
                                            {isYou && <em>You</em>}
                                          </span>
                                          <span className="leaderboard-score">{entry.score ?? "-"} pts</span>
                                        </li>
                                      );
                                    })}
                                  </ol>
                                ) : (
                                  <p className="leaderboard-empty">No attempts yet - be the first to take the quiz.</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="session-note is-tight">No contests are running for this course right now.</p>
                    )}
                  </section>
                </aside>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default function CourseOverviewPage() {
  return (
    <AuthGuard>
      <CourseOverview />
    </AuthGuard>
  );
}
