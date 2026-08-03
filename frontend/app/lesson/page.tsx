"use client";

import { useEffect, useRef, useState } from "react";
import {
  Captions,
  Check,
  FileText,
  Folder,
  Grid2X2,
  Lock,
  Maximize,
  Pause,
  Play,
  StickyNote,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

const lessons = [
  ["Project goals and stakeholders", "8 min video", "done"],
  ["Build a project charter", "10 min video", "done"],
  ["Identify project risks", "9 min video", "done"],
  ["Define scope and deliverables", "24 sec video - Playing", "playing"],
  ["Build a work breakdown structure", "11 min video", "next"],
  ["Module checkpoint quiz", "12 questions - Required", "locked"],
  ["Module wrap-up", "5 min reading", "locked"],
] as const;

const playbackRates = [1, 1.25, 1.5, 2] as const;

function formatTime(value: number) {
  if (!Number.isFinite(value)) {
    return "00:00";
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function LessonPlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [duration, setDuration] = useState(24);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const progress = duration ? Math.min(100, (currentTime / duration) * 100) : 0;
  const watchedPercent = Math.min(100, Math.round(progress));

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const sync = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 24);
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
  }, []);

  const togglePlayback = async () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      await video.play();
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.muted = !video.muted;
  };

  const toggleCaptions = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const next = !captionsEnabled;
    Array.from(video.textTracks).forEach((track) => {
      track.mode = next ? "showing" : "disabled";
    });
    setCaptionsEnabled(next);
  };

  const cyclePlaybackRate = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const currentIndex = playbackRates.findIndex((rate) => rate === video.playbackRate);
    const nextRate = playbackRates[(currentIndex + 1) % playbackRates.length] || 1;
    video.playbackRate = nextRate;
  };

  const enterFullscreen = async () => {
    const target = cardRef.current;

    if (!target) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await target.requestFullscreen();
  };

  const seek = (event: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const bounds = event.currentTarget.getBoundingClientRect();

    if (!video || !duration || bounds.width === 0) {
      return;
    }

    const nextProgress = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
    video.currentTime = nextProgress * duration;
  };

  return (
    <main className="lesson-player">
      <header className="lesson-topbar">
        <div className="lesson-brand-block">
          <img src="/basecamp-logo.png" alt="BaseCamp" />
          <span />
          <section>
            <strong>Google Project Management</strong>
            <p>Module 3 - Planning and execution</p>
          </section>
        </div>
        <div className="lesson-top-actions">
          <p>58% complete</p>
          <button type="button">
            <X size={16} />
            <span>Exit lesson</span>
          </button>
        </div>
      </header>

      <div className="lesson-shell">
        <section className="lesson-stage">
          <div className="lesson-heading">
            <p>LESSON 4 OF 7</p>
            <h1>Define scope and deliverables</h1>
            <span>24 sec video - Required</span>
          </div>

          <section className="video-card" aria-label="Video lesson player" ref={cardRef}>
            <video
              ref={videoRef}
              className="lesson-video-media"
              preload="metadata"
              poster="/basecamp-logo.png"
              playsInline
              onClick={togglePlayback}
            >
              <source src="/lesson-demo.mp4" type="video/mp4" />
              <track
                src="/lesson-demo.vtt"
                kind="captions"
                srcLang="en"
                label="English"
              />
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
              <strong>{isPlaying ? "Playing lesson demo" : `Resume from ${formatTime(currentTime)}`}</strong>
            </button>
            <div className="video-controls">
              <div
                className="video-progress"
                role="slider"
                aria-label="Video progress"
                aria-valuemin={0}
                aria-valuemax={Math.round(duration)}
                aria-valuenow={Math.round(currentTime)}
                onClick={seek}
              >
                <span style={{ width: `${progress}%` }} />
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
                  <button
                    type="button"
                    aria-label="Captions"
                    className={captionsEnabled ? "active" : ""}
                    onClick={toggleCaptions}
                  >
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

          <section className="watch-policy">
            <Lock size={18} />
            <p>Video controls are enabled for demo playback testing.</p>
            <strong>{watchedPercent}% watched</strong>
          </section>

          <section className="lesson-lower">
            <nav className="lesson-tabs" aria-label="Lesson sections">
              <button type="button" className="active">
                <Grid2X2 size={16} />
                <span>Overview</span>
              </button>
              <button type="button">
                <FileText size={16} />
                <span>Transcript</span>
              </button>
              <button type="button">
                <Folder size={16} />
                <span>Resources</span>
              </button>
              <button type="button">
                <StickyNote size={16} />
                <span>Notes</span>
              </button>
            </nav>

            <button type="button" className="mark-complete">
              <Lock size={16} />
              <span>Quiz unlocks after video</span>
            </button>
          </section>
        </section>

        <aside className="lesson-playlist">
          <header>
            <p>Module 3</p>
            <h2>Planning and execution</h2>
            <span>4 of 7 lessons - 58% course progress</span>
          </header>

          <div className="playlist-progress">
            <span />
          </div>

          <div className="playlist-list">
            {lessons.map(([title, meta, state], index) => (
              <article className={`playlist-row ${state}`} key={title}>
                <div>
                  {state === "done" && <Check size={18} />}
                  {state === "playing" && <Play size={17} />}
                  {state === "locked" && <Lock size={17} />}
                  {state === "next" && <span>{index + 1}</span>}
                </div>
                <section>
                  <h3>{title}</h3>
                  <p>{meta}</p>
                </section>
              </article>
            ))}
          </div>

          <section className="saved-card">
            <p>Progress saved</p>
            <span>Last activity: Jul 26, 2026 - 04:52</span>
            <strong>Quiz unlocks when this video reaches 100%.</strong>
          </section>
        </aside>
      </div>
    </main>
  );
}
