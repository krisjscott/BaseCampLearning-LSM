import {
  Captions,
  Check,
  FileText,
  Folder,
  Gauge,
  Grid2X2,
  Lock,
  Maximize,
  Play,
  StickyNote,
  Volume2,
  X,
} from "lucide-react";

const lessons = [
  ["Project goals and stakeholders", "8 min video", "done"],
  ["Build a project charter", "10 min video", "done"],
  ["Identify project risks", "9 min video", "done"],
  ["Define scope and deliverables", "12 min video - Playing", "playing"],
  ["Build a work breakdown structure", "11 min video", "next"],
  ["Module checkpoint quiz", "12 questions - Required", "locked"],
  ["Module wrap-up", "5 min reading", "locked"],
] as const;

export default function LessonPlayer() {
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
            <span>12 min video - Required</span>
          </div>

          <section className="video-card" aria-label="Video lesson player">
            <button type="button" className="video-surface">
              <span className="play-badge">
                <Play size={24} fill="none" />
              </span>
              <strong>Resume from 07:18</strong>
            </button>
            <div className="video-controls">
              <div className="video-progress">
                <span />
              </div>
              <div className="control-row">
                <button type="button" aria-label="Play">
                  <Play size={17} />
                </button>
                <p>07:18 / 12:00</p>
                <div className="control-icons">
                  <button type="button" aria-label="Volume">
                    <Volume2 size={17} />
                  </button>
                  <button type="button" aria-label="Captions">
                    <Captions size={17} />
                  </button>
                  <button type="button" aria-label="Playback speed">
                    <Gauge size={17} />
                  </button>
                  <button type="button" aria-label="Fullscreen">
                    <Maximize size={17} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="watch-policy">
            <Lock size={18} />
            <p>This video must be watched completely. Seeking ahead is disabled.</p>
            <strong>61% watched</strong>
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

