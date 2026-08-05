"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Captions,
  Check,
  Folder,
  Grid2X2,
  Maximize,
  Pause,
  Play,
  StickyNote,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  LessonResponse,
  ModuleResponse,
  getCourseModules,
  getCurrentUser,
  getLesson,
  getLessonsProgress,
  updateCourseProgress,
} from "../lib/backendApi";
import AuthGuard from "../components/AuthGuard";
import { CardSkeleton, Skeleton } from "../components/Skeleton";
import { decodeParam, encodeId } from "../lib/idCodec";

const playbackRates = [1, 1.25, 1.5, 2] as const;

function formatTime(value: number) {
  if (!Number.isFinite(value)) {
    return "00:00";
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

type Tab = "overview" | "resources" | "notes";

function LessonPlayer() {
  const router = useRouter();
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
  const [notes, setNotes] = useState("");

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [duration, setDuration] = useState(24);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  const videoUrl = lesson?.contentUrl || "/lesson-sample.mp4";
  const fallbackDuration = lesson?.durationMinutes ? lesson.durationMinutes * 60 : 24;
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
    Array.from(video.textTracks).forEach((track) => {
      track.mode = next ? "hidden" : "disabled";
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
            <video
              ref={videoRef}
              className="lesson-video-media"
              preload="metadata"
              poster="/basecamp-logo.png"
              playsInline
              onClick={togglePlayback}
              key={videoUrl}
            >
              <source src={videoUrl} type="video/mp4" />
              <track src="/lesson-sample.vtt" kind="captions" srcLang="en" label="English" />
            </video>
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
                  <button type="button" aria-label="Playback speed" onClick={cyclePlaybackRate}>
                    <span>{playbackRate}x</span>
                  </button>
                  <button type="button" aria-label="Fullscreen" onClick={enterFullscreen}>
                    <Maximize size={17} />
                  </button>
                </div>
              </div>
            </div>
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
                {lesson?.contentUrl ? (
                  <a href={lesson.contentUrl} target="_blank" rel="noreferrer">Open lesson resource -&gt;</a>
                ) : (
                  "No downloadable resources for this lesson."
                )}
              </p>
            )}
            {tab === "notes" && (
              <div className="lesson-tab-panel">
                <textarea
                  className="inline-textarea"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Jot down notes for this lesson (kept for this session only)"
                  rows={5}
                />
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
