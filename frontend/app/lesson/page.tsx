"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlignLeft,
  Bookmark,
  BookmarkCheck,
  Captions,
  Check,
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
import {
  LessonResponse,
  ModuleResponse,
  NoteResponse,
  createBookmark,
  createNote,
  deleteBookmark,
  deleteNote,
  getCourseModules,
  getCurrentUser,
  getLesson,
  getLessonsProgress,
  getMyBookmarks,
  getMyNotes,
  resolveMediaUrl,
  updateCourseProgress,
} from "../lib/backendApi";
import AuthGuard from "../components/AuthGuard";
import { CardSkeleton, Skeleton } from "../components/Skeleton";
import { useToast } from "../components/Toast";
import { decodeParam, encodeId } from "../lib/idCodec";
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
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [loadingLesson, setLoadingLesson] = useState(true);
  const [markedComplete, setMarkedComplete] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [savedNotes, setSavedNotes] = useState<NoteResponse[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptCue[]>([]);
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [duration, setDuration] = useState(24);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  const videoUrl = resolveMediaUrl(lesson?.contentUrl);
  const captionsUrl = resolveMediaUrl(lesson?.captionsUrl);
  const fallbackDuration = lesson?.durationMinutes ? lesson.durationMinutes * 60 : 24;
  const activeCaption = captionsEnabled
    ? transcript.find((cue) => currentTime >= cue.start && currentTime < cue.end)?.text || null
    : null;
  const progress = duration ? Math.min(100, (currentTime / duration) * 100) : 0;
  const watchedPercent = Math.min(100, Math.round(progress));
  const isComplete = markedComplete || watchedPercent >= 100;

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

    getLesson(id)
      .then(setLesson)
      .catch(() => setLesson(null))
      .finally(() => setLoadingLesson(false));

    if (courseParam) {
      getCourseModules(courseParam)
        .then((modules) => {
          const owningModule = modules.find((m) => m.id === modId) || modules.find((m) => m.lessons?.some((l) => l.id === id));
          setModule(owningModule || null);

          const lessonIds = (owningModule?.lessons || []).map((l) => l.id);
          getCurrentUser().then((user) => {
            if (!user || !lessonIds.length) return;
            getLessonsProgress(user.id, lessonIds)
              .then((rows) => setCompletedLessonIds(new Set(rows.filter((row) => row.completed).map((row) => row.lessonId))))
              .catch(() => undefined);
          });
        })
        .catch(() => setModule(null));
    }
  }, []);

  useEffect(() => {
    setDuration(fallbackDuration);
  }, [fallbackDuration]);

  useEffect(() => {
    if (!lesson) return;
    const type = (lesson.contentType || "").toUpperCase();
    if (type === "ARTICLE" || type === "DOCUMENT") {
      router.replace(`/reading-lesson?lessonId=${encodeId(lesson.id)}&courseId=${encodeId(courseId || "")}`);
    } else if (type === "ASSIGNMENT") {
      router.replace(`/assignment-submission?assignmentId=${encodeId(lesson.id)}&courseId=${encodeId(courseId || "")}`);
    } else if (type === "QUIZ") {
      router.replace(courseId ? `/course?courseId=${encodeId(courseId)}&tab=grades` : "/learning");
    }
  }, [lesson, courseId, router]);

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
      const created = await createNote({ courseId, lessonId, content, timestampSeconds: Math.floor(currentTime) });
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
    if (watchedPercent < 100 || markedComplete || !courseId || !userId || !lessonId) return;
    setMarkedComplete(true);
    updateCourseProgress(courseId, userId, {
      lessonId,
      completed: true,
      timeSpentMinutes: Math.round(duration / 60),
    })
      .then(() => setCompletedLessonIds((prev) => new Set(prev).add(lessonId)))
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedPercent, courseId, userId, lessonId]);

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
  const nextLesson = currentPosition >= 0 ? orderedLessons[currentPosition + 1] : undefined;

  function goToNextLesson() {
    if (!nextLesson || !courseId || !module) return;
    router.push(`/lesson?lessonId=${encodeId(nextLesson.id)}&moduleId=${encodeId(module.id)}&courseId=${encodeId(courseId)}`);
  }

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
          <p>{watchedPercent}% watched</p>
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
                <p>{module ? `${module.title.toUpperCase()}${currentPosition >= 0 ? ` - LESSON ${currentPosition + 1} OF ${orderedLessons.length}` : ""}` : "LESSON"}</p>
                <h1>{lesson.title}</h1>
                <span>{lesson.durationMinutes ? `${lesson.durationMinutes} min ${lesson.contentType?.toLowerCase() || "video"}` : lesson.contentType || "Lesson"}</span>
              </>
            )}
          </div>

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
                  placeholder={`Add a note at ${formatTime(currentTime)}...`}
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
                        <button type="button" className="transcript-timestamp" onClick={() => note.timestampSeconds != null && seekTo(note.timestampSeconds)}>
                          {note.timestampSeconds != null ? formatTime(note.timestampSeconds) : ""}
                        </button>
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

            <button type="button" className="mark-complete" onClick={goToNextLesson} disabled={!isComplete || !nextLesson}>
              <Check size={16} />
              <span>{!isComplete ? "Finish watching to continue" : nextLesson ? "Continue to next lesson" : "This was the last lesson"}</span>
            </button>
          </section>
        </section>

        <aside className="lesson-playlist">
          <header>
            <p>{module ? module.title : "Playlist"}</p>
            <h2>{module ? `${orderedLessons.length} lessons in this module` : "Open from a course to see the full playlist"}</h2>
            <span>{completedLessonIds.size} of {orderedLessons.length} lessons complete</span>
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
                    onClick={() => courseId && module && router.push(`/lesson?lessonId=${encodeId(item.id)}&moduleId=${encodeId(module.id)}&courseId=${encodeId(courseId)}`)}
                  >
                    <div>
                      {done && <Check size={18} />}
                      {!done && playing && <Play size={17} />}
                      {!done && !playing && <span>{index + 1}</span>}
                    </div>
                    <section>
                      <h3>{item.title}</h3>
                      <p>{item.durationMinutes ? `${item.durationMinutes} min` : item.contentType || "Lesson"}{playing ? " - Playing" : ""}</p>
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
