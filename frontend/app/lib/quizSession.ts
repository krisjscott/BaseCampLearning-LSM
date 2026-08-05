import { AssessmentResponse, AssessmentResultResponse } from "./backendApi";
import { encodeId } from "./idCodec";

const SESSION_KEY = "basecamp_quiz_session";
const RESULT_KEY = "basecamp_quiz_result";

export type QuizSession = {
  assessment: AssessmentResponse;
  selectedAnswers: Record<string, string>;
};

export type QuizResultSession = {
  assessment: AssessmentResponse;
  selectedAnswers: Record<string, string>;
  result: AssessmentResultResponse;
};

function readSession<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeSession(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

function clearSession(key: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(key);
}

export function saveQuizSession(session: QuizSession): void {
  writeSession(SESSION_KEY, session);
}

export function loadQuizSession(assessmentId: string): QuizSession | null {
  const session = readSession<QuizSession>(SESSION_KEY);
  return session && session.assessment.id === assessmentId ? session : null;
}

export function clearQuizSession(): void {
  clearSession(SESSION_KEY);
}

export function saveQuizResult(session: QuizResultSession): void {
  writeSession(RESULT_KEY, session);
}

export function loadQuizResult(assessmentId: string): QuizResultSession | null {
  const session = readSession<QuizResultSession>(RESULT_KEY);
  return session && session.assessment.id === assessmentId ? session : null;
}

export function clearQuizResult(): void {
  clearSession(RESULT_KEY);
}

export function courseExitHref(courseId?: string | null): string {
  return courseId ? `/course?courseId=${encodeId(courseId)}` : "/learning";
}
