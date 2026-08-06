"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlignLeft,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Captions,
  Check,
  FileText,
  Folder,
  Grid2X2,
  Maximize,
  Pause,
  Play,
  StickyNote,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import {
  AssignmentSubmissionResponse,
  LessonResponse,
  ModuleResponse,
  NoteResponse,
  ReadingContentResponse,
  createBookmark,
  createNote,
  deleteBookmark,
  deleteNote,
  getCourseModules,
  getCurrentUser,
  getLesson,
  getLessonReadingContent,
  getLessonsProgress,
  getMyAssignmentSubmission,
  getMyBookmarks,
  getMyNotes,
  resolveMediaUrl,
  submitAssignment,
  updateCourseProgress,
} from "../lib/backendApi";
import AuthGuard from "../components/AuthGuard";
import { CardSkeleton, Skeleton } from "../components/Skeleton";
import { useToast } from "../components/Toast";
import { decodeParam, encodeId } from "../lib/idCodec";
import { sanitizeLessonHtml } from "../lib/sanitizeHtml";
import { TranscriptCue, parseVtt } from "../lib/vtt";

const playbackRates = [1, 1.25, 1.5, 2] as const;

function formatTime(value: number) {
  if (!Number.isFinite(value)) {
    return "00:00";
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

type Tab = "overview" | "resources" | "transcript" | "notes";
type ContentKind = "VIDEO" | "ARTICLE" | "DOCUMENT" | "ASSIGNMENT" | "OTHER";

function contentKindOf(lesson: LessonResponse | null): ContentKind {
  const type = (lesson?.contentType || "VIDEO").toUpperCase();
  if (type === "ARTICLE" || type === "DOCUMENT" || type === "ASSIGNMENT") return type;
  if (type === "VIDEO") return "VIDEO";
  return "OTHER";
}

function LessonPlayer() {
  const router = useRouter();
  const toast = useToast();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);

  const [lessonId, setLessonId] = useState<string | null>(null);
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [module, setModule] = useState<ModuleResponse | null>(null);
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [loadingLesson, setLoadingLesson] = useState(true);
  const [markedComplete, setMarkedComplete] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [savedNotes, setSavedNotes] = useState<NoteResponse[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptCue[]>([]);
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  // ARTICLE / DOCUMENT content
  const [readingContent, setReadingContent] = useState<ReadingContentResponse | null>(null);

  // ASSIGNMENT content
  const [assignmentSubmission, setAssignmentSubmission] = useState<AssignmentSubmissionResponse | null>(null);
  const [assignmentText, setAssignmentText] = useState("");
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  const [submittingAssignment, setSubmittingAssignment] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [duration, setDuration] = useState(24);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  const kind = contentKindOf(lesson);
  const videoUrl = resolveMediaUrl(lesson?.contentUrl);
  const captionsUrl = resolveMediaUrl(lesson?.captionsUrl);
  const fallbackDuration = lesson?.durationMinutes ? lesson.durationMinutes * 60 : 24;
  const activeCaption = captionsEnabled
    ? transcript.find((cue) => currentTime >= cue.start && currentTime < cue.end)?.text || null
    : null;
  const progress = duration ? Math.min(100, (currentTime / duration) * 100) : 0;
  const watchedPercent = Math.min(100, Math.round(progress));
  const isComplete =
    markedComplete ||
    (lessonId ? completedLessonIds.has(lessonId) : false) ||
    (kind === "VIDEO" && watchedPercent >= 100);

  function kindLabel(contentType?: string | null): string {
    const type = (contentType || "").toUpperCase();
    if (type === "ASSIGNMENT") return "assignment";
    if (type === "QUIZ") return "quiz";
    return "lesson";
  }

  // Loads everything for one lesson (video/reading/assignment content + module +
  // progress). Pulled out of the mount effect so it can also be called after a
  // same-page lesson-to-lesson navigation (next/previous buttons, playlist row
  // click) - Next.js reuses this component instance for a router.push() to the
  // same /lesson route with just a different query string, so a mount-only
  // effect would never re-fetch and the player would silently keep showing the
  // previous lesson.
  function loadLesson(id: string, modId: string | null, courseParam: string | null) {
    setLoadingLesson(true);
    setMarkedComplete(false);
    setTab("overview");
    setCurrentTime(0);
    setIsPlaying(false);
    setNoteDraft("");
    setSavedNotes([]);
    setBookmarked(false);
    setTranscript([]);
    setReadingContent(null);
    setAssignmentSubmission(null);
    setAssignmentText("");
    setAssignmentFile(null);

    getLesson(id)
      .then((result) => {
        setLesson(result);
        const type = contentKindOf(result);
        if (type === "ARTICLE" || type === "DOCUMENT") {
          getLessonReadingContent(id).then(setReadingContent).catch(() => setReadingContent(null));
        } else if (type === "ASSIGNMENT") {
          getMyAssignmentSubmission(id)
            .then((submission) => {
              setAssignmentSubmission(submission);
              if (submission) setMarkedComplete(true);
              if (submission?.submissionText) setAssignmentText(submission.submissionText);
            })
            .catch(() => setAssignmentSubmission(null));
        } else if (type === "OTHER") {
          // QUIZ and any other non-inline content type still hands off to its own flow.
          router.replace(courseParam ? `/course?courseId=${encodeId(courseParam)}&tab=grades` : "/learning");
        }
      })
      .catch(() => setLesson(null))
      .finally(() => setLoadingLesson(false));

    if (courseParam) {
      getCourseModules(courseParam)
        .then((courseModules) => {
          setModules(courseModules);
          const owningModule = courseModules.find((m) => m.id === modId) || courseModules.find((m) => m.lessons?.some((l) => l.id === id));
          setModule(owningModule || null);

          // Completion state is tracked for every lesson in the course (not just the
          // current module) so the playlist and next-lesson button both know which
          // lessons in *other* modules are already done.
          const allLessonIds = courseModules.flatMap((m) => (m.lessons || []).map((l) => l.id));
          getCurrentUser().then((user) => {
            if (!user || !allLessonIds.length) return;
            getLessonsProgress(user.id, allLessonIds)
              .then((rows) => setCompletedLessonIds(new Set(rows.filter((row) => row.completed).map((row) => row.lessonId))))
              .catch(() => undefined);
          });
        })
        .catch(() => {
          setModules([]);
          setModule(null);
        });
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = decodeParam(params, "lessonId");
    const modId = decodeParam(params, "moduleId");
    const courseParam = decodeParam(params, "courseId");
    setLessonId(id);
    setModuleId(modId);
    setCourseId(courseParam);

    getCurrentUser().then((user) => setUserId(user?.id || null)).catch(() => undefined);

    if (!id) {
      setLoadingLesson(false);
      return;
    }

    loadLesson(id, modId, courseParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function navigateToLesson(targetLessonId: string, targetModuleId: string, targetCourseId: string) {
    setLessonId(targetLessonId);
    setModuleId(targetModuleId);
    router.push(`/lesson?lessonId=${encodeId(targetLessonId)}&moduleId=${encodeId(targetModuleId)}&courseId=${encodeId(targetCourseId)}`);
    loadLesson(targetLessonId, targetModuleId, targetCourseId);
  }

  useEffect(() => {
    setDuration(fallbackDuration);
  }, [fallbackDuration]);

  useEffect(() => {
    if (!lessonId || !courseId) return;
    getMyNotes(courseId, lessonId).then(setSavedNotes).catch(() => undefined);
    getMyBookmarks()
      .then((rows) => setBookmarked(rows.some((row) => row.lessonId === lessonId)))
      .catch(() => undefined);
  }, [lessonId, courseId]);

  async function saveNote() {
    const content = noteDraft.trim();
    if (!content || !courseId || !lessonId) return;
    setSavingNote(true);
    try {
      const created = await createNote({ courseId, lessonId, content, timestampSeconds: kind === "VIDEO" ? Math.floor(currentTime) : undefined });
      if (created) setSavedNotes((prev) => [created, ...prev]);
      setNoteDraft("");
      toast.success("Note saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save this note.");
    } finally {
      setSavingNote(false);
    }
  }

  async function removeNote(noteId: string) {
    try {
      await deleteNote(noteId);
      setSavedNotes((prev) => prev.filter((note) => note.id !== noteId));
    } catch {
      toast.error("Could not delete this note.");
    }
  }

  async function toggleBookmark() {
    if (!courseId || !lessonId) return;
    try {
      if (bookmarked) {
        await deleteBookmark(lessonId);
        setBookmarked(false);
        toast.success("Bookmark removed");
      } else {
        await createBookmark(courseId, lessonId);
        setBookmarked(true);
        toast.success("Lesson bookmarked");
      }
    } catch {
      toast.error("Could not update this bookmark.");
    }
  }

  useEffect(() => {
    if (!captionsUrl) {
      setTranscript([]);
      return;
    }
    let active = true;
    setTranscriptLoading(true);
    fetch(captionsUrl)
      .then((response) => response.text())
      .then((text) => {
        if (active) setTranscript(parseVtt(text));
      })
      .catch(() => {
        if (active) setTranscript([]);
      })
      .finally(() => {
        if (active) setTranscriptLoading(false);
      });
    return () => {
      active = false;
    };
  }, [captionsUrl]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const sync = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || fallbackDuration);
      setIsMuted(video.muted || video.volume === 0);
      setPlaybackRate(video.playbackRate);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener("loadedmetadata", sync);
    video.addEventListener("timeupdate", sync);
    video.addEventListener("volumechange", sync);
    video.addEventListener("ratechange", sync);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onPause);

    return () => {
      video.removeEventListener("loadedmetadata", sync);
      video.removeEventListener("timeupdate", sync);
      video.removeEventListener("volumechange", sync);
      video.removeEventListener("ratechange", sync);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onPause);
    };
  }, [fallbackDuration, videoUrl]);

  useEffect(() => {
    if (kind !== "VIDEO" || watchedPercent < 100 || markedComplete || !courseId || !userId || !lessonId) return;
    setMarkedComplete(true);
    updateCourseProgress(courseId, userId, {
      lessonId,
      completed: true,
      timeSpentMinutes: Math.round(duration / 60),
    })
      .then(() => {
        setCompletedLessonIds((prev) => new Set(prev).add(lessonId));
        toast.success("Lesson complete");
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedPercent, courseId, userId, lessonId, kind]);

  async function markReadingComplete() {
    if (markedComplete || markingComplete || !courseId || !userId || !lessonId) return;
    setMarkingComplete(true);
    try {
      await updateCourseProgress(courseId, userId, {
        lessonId,
        completed: true,
        timeSpentMinutes: lesson?.durationMinutes || undefined,
      });
      setMarkedComplete(true);
      setCompletedLessonIds((prev) => new Set(prev).add(lessonId));
      toast.success("Lesson complete");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not mark this lesson complete.");
    } finally {
      setMarkingComplete(false);
    }
  }

  async function handleSubmitAssignment() {
    if (!lessonId || (!assignmentText.trim() && !assignmentFile)) return;
    setSubmittingAssignment(true);
    try {
      const result = await submitAssignment(lessonId, assignmentText.trim() || undefined, assignmentFile || undefined);
      setAssignmentSubmission(result);
      setAssignmentFile(null);
      toast.success("Submission saved");
      if (courseId && userId && !markedComplete) {
        await updateCourseProgress(courseId, userId, { lessonId, completed: true, timeSpentMinutes: lesson?.durationMinutes || undefined }).catch(() => undefined);
        setCompletedLessonIds((prev) => new Set(prev).add(lessonId));
      }
      setMarkedComplete(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit this assignment.");
    } finally {
      setSubmittingAssignment(false);
    }
  }

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) await video.play();
    else video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  const toggleCaptions = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !captionsEnabled;
    // Captions render via our own overlay (driven by the parsed transcript,
    // positioned reliably above the controls bar) rather than the browser's
    // native <track> box, whose position can't be controlled consistently
    // across browsers. Keep the native track disabled so it never doubles up.
    Array.from(video.textTracks).forEach((track) => {
      track.mode = "disabled";
    });
    setCaptionsEnabled(next);
  };

  const cyclePlaybackRate = () => {
    const video = videoRef.current;
    if (!video) return;
    const currentIndex = playbackRates.findIndex((rate) => rate === video.playbackRate);
    const nextRate = playbackRates[(currentIndex + 1) % playbackRates.length] || 1;
    video.playbackRate = nextRate;
  };

  const enterFullscreen = async () => {
    const target = cardRef.current;
    if (!target) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await target.requestFullscreen();
  };

  const seekTo = (value: number) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const nextTime = Math.min(duration, Math.max(0, value));
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  function exitLesson() {
    router.push(courseId ? `/course?courseId=${encodeId(courseId)}` : "/learning");
  }

  const orderedLessons = [...(module?.lessons || [])].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  const currentPosition = orderedLessons.findIndex((item) => item.id === lessonId);

  // Flatten every module's lessons into one sequence (module order, then lesson
  // order within it) so "next/previous lesson" can cross module boundaries
  // instead of stopping dead at the edge of the current one.
  const orderedModules = [...modules].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  const courseSequence = orderedModules.flatMap((m) =>
    [...(m.lessons || [])].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)).map((l) => ({ lesson: l, moduleId: m.id })),
  );
  const coursePosition = courseSequence.findIndex((item) => item.lesson.id === lessonId);
  const nextEntry = coursePosition >= 0 ? courseSequence[coursePosition + 1] : undefined;
  const prevEntry = coursePosition > 0 ? courseSequence[coursePosition - 1] : undefined;
  const nextLesson = nextEntry?.lesson;
  const isLastLessonOfCourse = coursePosition >= 0 && !nextEntry && courseSequence.length > 0;

  function goToNextLesson() {
    if (!nextEntry || !courseId) return;
    navigateToLesson(nextEntry.lesson.id, nextEntry.moduleId, courseId);
  }

  function goToPreviousLesson() {
    if (!prevEntry || !courseId) return;
    navigateToLesson(prevEntry.lesson.id, prevEntry.moduleId, courseId);
  }

  const readingHtml = !readingContent?.contentMarkdown && readingContent?.contentHtml ? sanitizeLessonHtml(readingContent.contentHtml) : "";
  const readingSections = !readingContent
    ? (lesson?.description || "").split(/\n{2,}/).map((part) => part.trim()).filter(Boolean)
    : [];

  return (
    <main className="lesson-player">
      <header className="lesson-topbar">
        <div className="lesson-brand-block">
          <img src="/basecamp-logo.png" alt="BaseCamp" />
          <span />
          <section>
            {loadingLesson ? (
              <>
                <Skeleton className="skeleton-copy" />
                <Skeleton className="skeleton-copy" />
              </>
            ) : (
              <>
                <strong>{lesson?.title || "Lesson player"}</strong>
                <p>{lesson?.contentType || "Course lesson"}</p>
              </>
            )}
          </section>
        </div>
        <div className="lesson-top-actions">
          {kind === "VIDEO" && <p>{watchedPercent}% watched</p>}
          <button type="button" onClick={exitLesson}>
            <X size={16} />
            <span>Exit lesson</span>
          </button>
        </div>
      </header>

      <div className="lesson-shell">
        <section className="lesson-stage">
          <div className="lesson-heading">
            {loadingLesson ? (
              <CardSkeleton lines={3} />
            ) : !lesson ? (
              <>
                <h1>Lesson not found</h1>
                <span>Open this page from a course to load a real lesson.</span>
              </>
            ) : (
              <>
                <p>{module ? `${module.title.toUpperCase()}${currentPosition >= 0 ? ` - ${kindLabel(lesson.contentType).toUpperCase()} ${currentPosition + 1} OF ${orderedLessons.length}` : ""}` : kindLabel(lesson.contentType).toUpperCase()}</p>
                <h1>{lesson.title}</h1>
                <span>{lesson.durationMinutes ? `${lesson.durationMinutes} min ${lesson.contentType?.toLowerCase() || "video"}` : lesson.contentType || "Lesson"}</span>
              </>
            )}
          </div>

          {kind === "VIDEO" && (
            <section className="video-card" aria-label="Video lesson player" ref={cardRef}>
              {!loadingLesson && !videoUrl ? (
                <div className="video-empty-state">
                  <p>No video has been uploaded for this lesson yet.</p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  className="lesson-video-media"
                  preload="metadata"
                  poster="/basecamp-logo.png"
                  playsInline
                  onClick={togglePlayback}
                  key={videoUrl}
                >
                  {videoUrl && <source src={videoUrl} type="video/mp4" />}
                  {captionsUrl && <track src={captionsUrl} kind="captions" srcLang="en" label="English" />}
                </video>
              )}
              {(loadingLesson || videoUrl) && (
                <button
                  type="button"
                  className={`video-surface ${isPlaying ? "is-playing" : ""}`}
                  onClick={togglePlayback}
                  aria-label={isPlaying ? "Pause lesson video" : "Play lesson video"}
                >
                  <span className="play-badge">
                    {isPlaying ? <Pause size={24} fill="none" /> : <Play size={24} fill="none" />}
                  </span>
                  <strong>{loadingLesson ? "Loading lesson..." : isPlaying ? "Playing lesson" : `Resume from ${formatTime(currentTime)}`}</strong>
                </button>
              )}
              {activeCaption && (
                <div className="video-caption-overlay" aria-live="polite">
                  <span>{activeCaption}</span>
                </div>
              )}
              {(loadingLesson || videoUrl) && (
              <div className="video-controls">
                <div className="video-progress" aria-label="Video progress">
                  <span style={{ width: `${progress}%` }} />
                  <input
                    className="video-progress-input"
                    type="range"
                    min={0}
                    max={Math.max(duration, 0.1)}
                    step={0.1}
                    value={Math.min(currentTime, duration)}
                    aria-label="Seek video"
                    onInput={(event) => seekTo(Number(event.currentTarget.value))}
                    onChange={(event) => seekTo(Number(event.currentTarget.value))}
                  />
                </div>
                <div className="control-row">
                  <button type="button" aria-label={isPlaying ? "Pause" : "Play"} onClick={togglePlayback}>
                    {isPlaying ? <Pause size={17} /> : <Play size={17} />}
                  </button>
                  <p>{formatTime(currentTime)} / {formatTime(duration)}</p>
                  <div className="control-spacer" />
                  <div className="control-icons">
                    <button type="button" aria-label={isMuted ? "Unmute" : "Volume"} onClick={toggleMute}>
                      {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                    </button>
                    <button type="button" aria-label="Captions" className={captionsEnabled ? "active" : ""} onClick={toggleCaptions}>
                      <Captions size={17} />
                    </button>
                    <button
                      type="button"
                      aria-label={bookmarked ? "Remove bookmark" : "Bookmark this lesson"}
                      className={bookmarked ? "active" : ""}
                      onClick={toggleBookmark}
                    >
                      {bookmarked ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                    </button>
                    <button type="button" aria-label="Playback speed" onClick={cyclePlaybackRate}>
                      <span>{playbackRate}x</span>
                    </button>
                    <button type="button" aria-label="Fullscreen" onClick={enterFullscreen}>
                      <Maximize size={17} />
                    </button>
                  </div>
                </div>
              </div>
              )}
            </section>
          )}

          {(kind === "ARTICLE" || kind === "DOCUMENT") && !loadingLesson && (
            <section className="reading-card" aria-label="Lesson reading content">
              <div className="reading-card-body">
                {kind === "DOCUMENT" && lesson?.contentUrl ? (
                  <div className="reading-document-cta">
                    <FileText size={22} />
                    <div>
                      <h3>{lesson.title}</h3>
                      <p>This lesson's material is a downloadable document.</p>
                    </div>
                    <a href={resolveMediaUrl(lesson.contentUrl)} target="_blank" rel="noreferrer">Open document -&gt;</a>
                  </div>
                ) : readingContent?.contentMarkdown ? (
                  <div className="reading-lesson-markdown">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {readingContent.contentMarkdown}
                    </ReactMarkdown>
                  </div>
                ) : readingHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: readingHtml }} />
                ) : readingSections.length ? (
                  readingSections.map((section, index) => <p key={index}>{section}</p>)
                ) : (
                  <p>No reading content available for this lesson.</p>
                )}
              </div>
              <button type="button" className="mark-complete is-primary" onClick={markReadingComplete} disabled={isComplete || markingComplete}>
                <Check size={16} />
                <span>{isComplete ? "Marked complete" : markingComplete ? "Saving..." : "Mark this lesson complete"}</span>
              </button>
            </section>
          )}

          {kind === "ASSIGNMENT" && !loadingLesson && (
            <section className="assignment-card" aria-label="Assignment submission">
              <div className="inline-composer-card">
                <div className="card-title">
                  <h3>Written response</h3>
                  <p>Add your response for this assignment</p>
                </div>
                <textarea
                  className="inline-textarea"
                  value={assignmentText}
                  onChange={(event) => setAssignmentText(event.target.value)}
                  placeholder="Write your response..."
                  rows={5}
                />
              </div>
              <div className="inline-composer-card">
                <div className="card-title">
                  <h3>Supporting document</h3>
                  <p>Attach a file for this assignment</p>
                </div>
                <input type="file" onChange={(event) => setAssignmentFile(event.target.files?.[0] || null)} />
                {assignmentFile ? (
                  <p className="field-note">Selected: {assignmentFile.name}, ready to submit</p>
                ) : assignmentSubmission?.fileUrl ? (
                  <p className="field-note">
                    <a href={assignmentSubmission.fileUrl} target="_blank" rel="noreferrer">Previously submitted file -&gt;</a>
                  </p>
                ) : null}
              </div>
              {assignmentSubmission?.status === "GRADED" && (
                <div className="assignment-feedback">
                  <p className="session-note is-tight">Graded by {assignmentSubmission.gradedByName || "an instructor"} - Score: {assignmentSubmission.score ?? "-"}</p>
                  <p>{assignmentSubmission.feedback || "No written feedback was left."}</p>
                </div>
              )}
              <button
                type="button"
                className="mark-complete is-primary"
                onClick={handleSubmitAssignment}
                disabled={submittingAssignment || (!assignmentText.trim() && !assignmentFile)}
              >
                <Check size={16} />
                <span>{submittingAssignment ? "Submitting..." : assignmentSubmission ? "Resubmit assignment" : "Submit assignment"}</span>
              </button>
            </section>
          )}

          <section className="lesson-lower">
            <nav className="lesson-tabs" aria-label="Lesson sections">
              <button type="button" className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>
                <Grid2X2 size={16} />
                <span>Overview</span>
              </button>
              <button type="button" className={tab === "resources" ? "active" : ""} onClick={() => setTab("resources")}>
                <Folder size={16} />
                <span>Resources</span>
              </button>
              {captionsUrl && (
                <button type="button" className={tab === "transcript" ? "active" : ""} onClick={() => setTab("transcript")}>
                  <AlignLeft size={16} />
                  <span>Transcript</span>
                </button>
              )}
              <button type="button" className={tab === "notes" ? "active" : ""} onClick={() => setTab("notes")}>
                <StickyNote size={16} />
                <span>Notes</span>
              </button>
            </nav>
          </section>

          <div className="lesson-panel-area">
            {tab === "overview" && (
              <p className="lesson-tab-panel">{lesson?.description || "No description was provided for this lesson."}</p>
            )}
            {tab === "resources" && (
              <p className="lesson-tab-panel">
                {videoUrl ? (
                  <a href={videoUrl} target="_blank" rel="noreferrer">Open lesson resource -&gt;</a>
                ) : (
                  "No downloadable resources for this lesson."
                )}
              </p>
            )}
            {tab === "transcript" && (
              <div className="lesson-tab-panel lesson-transcript">
                {transcriptLoading ? (
                  <CardSkeleton lines={4} />
                ) : transcript.length ? (
                  transcript.map((cue, index) => (
                    <button
                      type="button"
                      key={index}
                      className="transcript-line"
                      onClick={() => seekTo(cue.start)}
                    >
                      <span className="transcript-timestamp">{formatTime(cue.start)}</span>
                      <span>{cue.text}</span>
                    </button>
                  ))
                ) : (
                  <p>No transcript available for this lesson.</p>
                )}
              </div>
            )}
            {tab === "notes" && (
              <div className="lesson-tab-panel lesson-notes-panel">
                <textarea
                  className="inline-textarea"
                  value={noteDraft}
                  onChange={(event) => setNoteDraft(event.target.value)}
                  placeholder={kind === "VIDEO" ? `Add a note at ${formatTime(currentTime)}...` : `Add a note for this ${kindLabel(lesson?.contentType)}...`}
                  rows={3}
                />
                <button type="button" className="mark-complete" onClick={saveNote} disabled={!noteDraft.trim() || savingNote}>
                  <StickyNote size={16} />
                  <span>{savingNote ? "Saving..." : "Save note"}</span>
                </button>
                <div className="lesson-notes-list">
                  {savedNotes.length ? (
                    savedNotes.map((note) => (
                      <div className="lesson-note-row" key={note.id}>
                        {note.timestampSeconds != null && (
                          <button type="button" className="transcript-timestamp" onClick={() => seekTo(note.timestampSeconds!)}>
                            {formatTime(note.timestampSeconds)}
                          </button>
                        )}
                        <p>{note.content}</p>
                        <button type="button" aria-label="Delete note" onClick={() => removeNote(note.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p>No notes yet for this lesson.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lesson-continue-row">
            <button type="button" className="mark-complete" onClick={goToPreviousLesson} disabled={!prevEntry}>
              <ArrowLeft size={16} />
              <span>{prevEntry ? `Previous ${kindLabel(prevEntry.lesson.contentType)}` : "Previous lesson"}</span>
            </button>
            <button
              type="button"
              className={`mark-complete ${isComplete && nextLesson ? "is-primary" : ""}`}
              onClick={goToNextLesson}
              disabled={!isComplete || !nextLesson}
            >
              <span>
                {!isComplete
                  ? kind === "VIDEO"
                    ? "Finish watching to continue"
                    : `Complete this ${kindLabel(lesson?.contentType)} to continue`
                  : nextLesson
                    ? `Continue to next ${kindLabel(nextLesson.contentType)}`
                    : isLastLessonOfCourse
                      ? "You've completed this course!"
                      : `This was the last ${kindLabel(lesson?.contentType)}`}
              </span>
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        <aside className="lesson-playlist">
          <header>
            <p>{module ? module.title : "Playlist"}</p>
            <h2>{module ? `${orderedLessons.length} lessons in this module` : "Open from a course to see the full playlist"}</h2>
            <span>{orderedLessons.filter((item) => completedLessonIds.has(item.id)).length} of {orderedLessons.length} lessons complete</span>
          </header>

          <div className="playlist-list">
            {orderedLessons.map((item, index) => {
              const done = completedLessonIds.has(item.id) || (item.id === lessonId && isComplete);
              const playing = item.id === lessonId;
              return (
                <article className={`playlist-row ${done ? "done" : playing ? "playing" : "next"}`} key={item.id}>
                  <button
                    type="button"
                    className="playlist-row-link"
                    onClick={() => courseId && module && item.id !== lessonId && navigateToLesson(item.id, module.id, courseId)}
                  >
                    <div>
                      {done && <Check size={18} />}
                      {!done && playing && <Play size={17} />}
                      {!done && !playing && <span>{index + 1}</span>}
                    </div>
                    <section>
                      <h3>{item.title}</h3>
                      <p>{item.durationMinutes ? `${item.durationMinutes} min` : kindLabel(item.contentType).replace(/^./, (c) => c.toUpperCase())}{playing ? " - Playing" : ""}</p>
                    </section>
                  </button>
                </article>
              );
            })}
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function LessonPlayerPage() {
  return (
    <AuthGuard>
      <LessonPlayer />
    </AuthGuard>
  );
}
