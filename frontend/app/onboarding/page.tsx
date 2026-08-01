"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  Compass,
  Eye,
  LayoutDashboard,
  Loader,
  Rocket,
  Search,
} from "lucide-react";
import { UserResponse, getCurrentUser, updateCurrentUser } from "../lib/backendApi";

const goals = [
  {
    title: "Build job-ready skills",
    description: "Prepare for your first role",
    icon: BriefcaseBusiness,
  },
  {
    title: "Change career direction",
    description: "Learn skills for a new field",
    icon: Rocket,
  },
  {
    title: "Grow in my current role",
    description: "Advance with practical capability",
    icon: BarChart3,
  },
  {
    title: "Explore something new",
    description: "Follow a topic that interests you",
    icon: Compass,
  },
];

const interests = [
  "Graphic Design",
  "Data Analytics",
  "Marketing",
  "Product Design",
  "Leadership",
  "Business Operations",
  "Software Development",
  "Communication",
  "Sales",
  "Human Resources",
  "Finance",
  "Entrepreneurship",
];

const profileTypes = [
  "Working professional",
  "Student",
  "Freelancer",
  "Founder or business owner",
  "Exploring opportunities",
];

const education = [
  "School or secondary education",
  "Diploma or vocational qualification",
  "Undergraduate degree or currently studying",
  "Postgraduate or professional qualification",
  "Learning through work experience",
  "Prefer not to say",
];

const pathItems = [
  ["Starter", "Project Management Foundations", "Start here", true],
  ["Builder", "Content Strategy Essentials", "Next", false],
  ["Achiever", "Product Design Basics", "Later", false],
] as const;

const courses = [
  ["Google Project Management", "6 modules - Beginner", "Certificate"],
  ["Content Writing Foundations", "4 modules - Beginner", "Popular"],
  ["Graphic Design Essentials", "5 modules - Beginner", "New"],
] as const;

function OnboardingTopbar({
  learnerName,
  step,
  progress,
  simpleLabel,
  dashboard = false,
  onExit,
}: {
  learnerName: string;
  step?: string;
  progress?: number;
  simpleLabel?: string;
  dashboard?: boolean;
  onExit?: () => void;
}) {
  return (
    <>
      <header className={`onboarding-topbar${simpleLabel ? " simple" : ""}`}>
        <img src="/BasecampExactLogo.png" alt="BaseCamp" className="onboarding-logo" />
        {dashboard ? (
          <nav className="dashboard-nav" aria-label="Learning navigation">
            <a href="/explore">Browse</a>
            <a href="/my-learning">My learning</a>
            <button type="button" aria-label={`${learnerName} profile`}>
              {learnerName.charAt(0).toUpperCase()}
            </button>
          </nav>
        ) : (
          <div className="topbar-actions">
            <span>{simpleLabel ?? step}</span>
            {!simpleLabel && (
              <button type="button" onClick={onExit}>
                Exit
              </button>
            )}
          </div>
        )}
      </header>
      {progress !== undefined && <div className="step-progress" style={{ width: `${progress}%` }} />}
    </>
  );
}

function Footer({
  note,
  final,
  onBack,
  onNext,
  disableBack,
}: {
  note?: string;
  final?: boolean;
  onBack: () => void;
  onNext: () => void;
  disableBack?: boolean;
}) {
  return (
    <footer className="onboarding-footer">
      {note ? <p>{note}</p> : <span />}
      <div className="footer-actions">
        <button type="button" className="secondary-button" onClick={onBack} disabled={disableBack}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <button type="button" className={final ? "accent-button" : "inverse-button"} onClick={onNext}>
          {final ? <Loader size={16} /> : <ArrowRight size={16} />}
          <span>{final ? "Build my learning plan" : "Next"}</span>
        </button>
      </div>
    </footer>
  );
}

export default function OnboardingScreens() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(goals[0].title);
  const [selectedInterests, setSelectedInterests] = useState([
    "Project Management",
    "Content Strategy",
  ]);
  const [profileType, setProfileType] = useState(profileTypes[0]);
  const [role, setRole] = useState("Product Designer");
  const [educationLevel, setEducationLevel] = useState(education[2]);

  const isReady = step === 5;
  const isLoading = step === 4;
  const learnerName = user?.fullName?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((data) => {
        if (active && data) setUser(data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoading) return;
    const timer = window.setTimeout(() => setStep(5), 1400);
    return () => window.clearTimeout(timer);
  }, [isLoading]);

  const progress = useMemo(() => Math.min((step + 1) * 25, 100), [step]);

  function next() {
    setStep((current) => Math.min(current + 1, 5));
  }

  function back() {
    setStep((current) => Math.max(current - 1, 0));
  }

  function toggleInterest(item: string) {
    setSelectedInterests((current) => {
      if (current.includes(item)) {
        return current.filter((selected) => selected !== item);
      }

      if (current.length >= 5) {
        return current;
      }

      return [...current, item];
    });
  }

  async function completeOnboarding() {
    await updateCurrentUser({
      fullName: user?.fullName || "",
      bio: `${goal} - ${selectedInterests.join(", ")} - ${profileType} - ${role} - ${educationLevel}`,
    }).catch(() => null);
    router.push("/learning");
  }

  return (
    <main className="onboarding-page flow">
      <section className={`onboarding-screen${isLoading ? " personalising-screen" : ""}${isReady ? " ready-screen" : ""}`}>
        {step < 4 && (
          <OnboardingTopbar
            learnerName={learnerName}
            step={`Step ${step + 1} of 4`}
            progress={progress}
            onExit={() => setStep(0)}
          />
        )}

        {isLoading && <OnboardingTopbar learnerName={learnerName} simpleLabel="Preparing your BaseCamp" />}
        {isReady && <OnboardingTopbar learnerName={learnerName} dashboard />}

        {step === 0 && (
          <>
            <div className="goal-content">
              <div className="screen-heading">
                <p>Welcome, {learnerName}</p>
                <h1>What would you like to achieve?</h1>
                <span>
                  Choose the goal that best matches where you are today. We&apos;ll use it to
                  personalise your recommendations.
                </span>
              </div>
              <div className="goal-grid">
                {goals.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      type="button"
                      className={`goal-card${goal === item.title ? " selected" : ""}`}
                      key={item.title}
                      onClick={() => setGoal(item.title)}
                    >
                      <div className="goal-icon">
                        <Icon size={42} strokeWidth={1.8} />
                      </div>
                      <strong>{item.title}</strong>
                      <span>{item.description}</span>
                    </button>
                  );
                })}
              </div>
              <p className="hint-pill">You can change this later in your learning preferences.</p>
            </div>
            <Footer
              note="Your selection helps BaseCamp organise courses around your goals."
              onBack={back}
              onNext={next}
              disableBack
            />
          </>
        )}

        {step === 1 && (
          <>
            <div className="interests-content">
              <div className="screen-heading">
                <p>Build your learning profile</p>
                <h1>Which roles or skill areas interest you?</h1>
                <span>Choose up to five. BaseCamp will use these to organise relevant courses and certifications.</span>
              </div>
              <label className="search-field">
                <Search size={20} />
                <input placeholder="Search roles, topics or skills" aria-label="Search roles, topics or skills" />
              </label>
              <div className="selected-tags">
                {selectedInterests.map((item) => (
                  <button type="button" key={item} onClick={() => toggleInterest(item)}>
                    {item} <span>x</span>
                  </button>
                ))}
              </div>
              <div className="interest-grid">
                {interests.map((item) => {
                  const selected = selectedInterests.includes(item);
                  return (
                    <button
                      type="button"
                      className={selected ? "selected" : ""}
                      key={item}
                      onClick={() => toggleInterest(item)}
                    >
                      <span>{item}</span>
                      <span>{selected ? "x" : "+"}</span>
                    </button>
                  );
                })}
              </div>
              <p className="hint-pill">{selectedInterests.length} of 5 selected</p>
            </div>
            <Footer onBack={back} onNext={next} />
          </>
        )}

        {step === 2 && (
          <>
            <div className="context-content">
              <div className="screen-heading">
                <p>Personalise your experience</p>
                <h1>What best describes you today?</h1>
                <span>This helps us recommend the right course level and learning pace.</span>
              </div>
              <div className="profile-pills">
                {profileTypes.map((type) => (
                  <button
                    type="button"
                    className={profileType === type ? "selected" : ""}
                    key={type}
                    onClick={() => setProfileType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="role-search">
                <label htmlFor="role-title">Current role or job title</label>
                <div>
                  <Search size={20} />
                  <input
                    id="role-title"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    aria-label="Current role or job title"
                  />
                </div>
              </div>
              <div className="suggestions">
                <p>Suggested matches</p>
                {["Product Designer", "Graphic Designer", "Product Manager", "Content Designer"].map((item) => (
                  <button
                    type="button"
                    className={role === item ? "selected" : ""}
                    key={item}
                    onClick={() => setRole(item)}
                  >
                    <span>{item}</span>
                    {role === item && <strong>Selected</strong>}
                  </button>
                ))}
              </div>
            </div>
            <Footer onBack={back} onNext={next} />
          </>
        )}

        {step === 3 && (
          <>
            <div className="education-content">
              <div className="screen-heading">
                <p>Final step</p>
                <h1>What is your highest level of education?</h1>
                <span>This is optional and only helps BaseCamp recommend the right starting level.</span>
              </div>
              <div className="education-list">
                {education.map((level) => (
                  <button
                    type="button"
                    className={educationLevel === level ? "selected" : ""}
                    key={level}
                    onClick={() => setEducationLevel(level)}
                  >
                    <span className="radio-dot">{educationLevel === level && <Check size={12} />}</span>
                    <span>{level}</span>
                  </button>
                ))}
              </div>
              <p className="hint-pill">You can update or remove this information from your profile.</p>
            </div>
            <Footer final onBack={back} onNext={next} />
          </>
        )}

        {isLoading && (
          <div className="personalising-card" role="status" aria-live="polite">
            <div className="check-badge">
              <Loader size={26} className="loader-icon" />
            </div>
            <div className="screen-heading">
              <h1>Building your learning plan</h1>
              <span>Matching your goals and interests with the right courses, levels and certifications.</span>
            </div>
            <div className="loading-bar" aria-label="Learning plan progress">
              <span />
            </div>
            <div className="loading-tags">
              {[goal, ...selectedInterests.slice(0, 3)].map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <p>This usually takes only a few seconds.</p>
          </div>
        )}

        {isReady && (
          <>
            <div className="ready-hero">
              <div>
                <p>Your learning plan is ready</p>
                <h1>A focused path, built around your goals.</h1>
                <span>Start with project management, strengthen communication, then add a design specialisation.</span>
              </div>
              <button type="button" onClick={completeOnboarding}>
                <LayoutDashboard size={16} />
                <span>Open my dashboard</span>
              </button>
            </div>
            <div className="ready-layout">
              <aside className="path-card">
                <h2>Recommended path</h2>
                <p>Based on your onboarding answers</p>
                <div className="path-list">
                  {pathItems.map(([level, title, status, active]) => (
                    <div className="path-row" key={title}>
                      <span className={active ? "active" : ""}>{level[0]}</span>
                      <div>
                        <p>{level}</p>
                        <strong>{title}</strong>
                      </div>
                      <em>{status}</em>
                    </div>
                  ))}
                </div>
              </aside>
              <section className="course-panel">
                <div className="course-heading">
                  <h2>Recommended for you</h2>
                  <a href="/explore">View all courses</a>
                </div>
                <div className="course-grid">
                  {courses.map(([title, meta, badge]) => (
                    <article className="course-card" key={title}>
                      <div>
                        <span>BaseCamp course</span>
                        <strong>{badge}</strong>
                      </div>
                      <section>
                        <h3>{title}</h3>
                        <p>{meta}</p>
                        <button type="button" onClick={() => router.push("/course")}>
                          <Eye size={16} />
                          <span>View course</span>
                        </button>
                      </section>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

