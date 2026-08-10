export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type AuthPayload = {
  accessToken: string;
  refreshToken: string;
  email: string;
  role: string;
  fullName?: string | null;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type CourseResponse = {
  id: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  instructorName?: string | null;
  categoryName?: string | null;
  visibility?: string | null;
  status?: string | null;
  durationHours?: number | null;
  price?: number | null;
  rating?: number | string | null;
  totalEnrollments?: number | null;
  createdAt?: string | null;
};

export type SearchResultResponse = {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  additionalInfo?: string | null;
};

export type SearchResponse = {
  results: SearchResultResponse[];
  totalHits: number;
  page: number;
  size: number;
};

export type LessonResponse = {
  id: string;
  title: string;
  description?: string | null;
  contentUrl?: string | null;
  captionsUrl?: string | null;
  contentType?: string | null;
  durationMinutes?: number | null;
  orderIndex?: number | null;
};

export type ModuleResponse = {
  id: string;
  title: string;
  description?: string | null;
  orderIndex?: number | null;
  lessons?: LessonResponse[] | null;
};

export type CourseProgressResponse = {
  id: string;
  courseId: string;
  courseTitle?: string | null;
  lastLessonId?: string | null;
  lastLessonTitle?: string | null;
  completionPercentage?: number | null;
  timeSpentMinutes?: number | null;
  lastAccessedAt?: string | null;
};

export type AssessmentOptionResponse = {
  id: string;
  optionText: string;
};

export type AssessmentQuestionResponse = {
  id: string;
  questionText: string;
  questionType?: string | null;
  points?: number | null;
  orderIndex?: number | null;
  options?: AssessmentOptionResponse[] | null;
};

export type AssessmentResponse = {
  id: string;
  title: string;
  description?: string | null;
  courseId?: string | null;
  type?: string | null;
  passingScore?: number | null;
  timeLimitMinutes?: number | null;
  maxAttempts?: number | null;
  questions?: AssessmentQuestionResponse[] | null;
};

export type AssessmentResultResponse = {
  id: string;
  assessmentId: string;
  assessmentTitle?: string | null;
  score?: number | null;
  attemptNumber?: number | null;
  passed: boolean;
  submittedAt?: string | null;
};

export type CertificateResponse = {
  id: string;
  certificateNumber: string;
  title: string;
  recipientName?: string | null;
  courseName?: string | null;
  issuerName?: string | null;
  issuedDate?: string | null;
  fileUrl?: string | null;
};

export type NotificationResponse = {
  id: string;
  title: string;
  message: string;
  type?: string | null;
  category?: string | null;
  read: boolean;
  readAt?: string | null;
  actionUrl?: string | null;
  createdAt?: string | null;
};

export type UserResponse = {
  id: string;
  fullName?: string | null;
  email: string;
  profilePictureUrl?: string | null;
  learnerCode?: string | null;
  phone?: string | null;
  bio?: string | null;
  role?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
};

export type UserSettingsResponse = {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  language?: string | null;
  timezone?: string | null;
};

export type PublicDashboardResponse = {
  xpPoints?: number | null;
  continueLearning?: Array<{
    courseId: string;
    courseTitle: string;
    thumbnailUrl?: string | null;
    completionPercentage?: number | null;
    lastAccessedAt?: string | null;
  }>;
  recommendedCourses?: Array<{
    courseId: string;
    courseTitle: string;
    thumbnailUrl?: string | null;
    instructorName?: string | null;
    rating?: number | string | null;
    totalEnrollments?: number | null;
  }>;
  recentActivities?: Array<{
    activityType: string;
    description: string;
    activityDate?: string | null;
  }>;
};

const AUTH_STORAGE_KEYS = {
  accessToken: "basecamp_access_token",
  refreshToken: "basecamp_refresh_token",
  email: "basecamp_email",
  role: "basecamp_role",
  fullName: "basecamp_full_name",
};

const SESSION_COOKIE = "basecamp_session";
const AUTH_ROUTES = new Set(["/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/refresh"]);

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const API_BASE_URL = configuredApiBaseUrl?.replace(/\/$/, "")
  || (process.env.NODE_ENV === "development"
    ? "http://localhost:8081"
    : (() => {
        throw new Error("NEXT_PUBLIC_API_BASE_URL must be set for production builds");
      })());

/**
 * Uploaded media (lesson videos, captions) is served by the backend under
 * `/uploads/**`, not by Next.js - relative paths returned by the API need the
 * backend origin prefixed before they can be used in <video>/<track>/fetch.
 */
export function resolveMediaUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path}`;
}

let refreshPromise: Promise<string | null> | null = null;

function getSessionCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]*)`));
  return match ? match[1] : null;
}

function setSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}

function redirectToLogin(): void {
  const publicRecoveryRoute = typeof window !== "undefined"
    && (window.location.pathname === "/recover-access" || window.location.pathname.startsWith("/recover-access/"));
  if (typeof window !== "undefined" && window.location.pathname !== "/" && !publicRecoveryRoute) {
    window.location.href = "/";
  }
}

async function doRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = typeof window !== "undefined"
        ? localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken)
        : null;

      if (!refreshToken) return null;

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return null;

      const body = (await response.json()) as ApiEnvelope<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      }>;

      if (!body.data) return null;

      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, body.data.accessToken);
        localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, body.data.refreshToken);
      }

      setSessionCookie();
      return body.data.accessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function parseResponse<T>(response: Response): Promise<ApiEnvelope<T>> {
  const text = await response.text();
  let body: any = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch (e) {
      const serverText = text.substring(0, 200).trim();
      if (serverText.toLowerCase().includes("invalid cors request")) {
        throw new Error(
          "Backend rejected this browser origin. Add the frontend origin to backend CORS_ALLOWED_ORIGINS and restart the backend.",
        );
      }
      if (!response.ok) {
        throw new Error(serverText || `Backend request failed: ${response.status} ${response.statusText}`);
      }
      throw new Error(`Invalid JSON response from backend: ${response.status} ${response.statusText}`);
    }
  }

  if (!response.ok) {
    const error = new Error(body?.message || response.statusText || "Backend request failed") as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return body as ApiEnvelope<T>;
}

/** For endpoints that stream a binary file (e.g. a rendered certificate PDF) instead of the usual JSON envelope. */
export async function backendFetchBlob(path: string): Promise<Blob> {
  const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_STORAGE_KEYS.accessToken) : null;
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { headers });
  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.status} ${response.statusText}`);
  }
  return response.blob();
}

export async function backendRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiEnvelope<T>> {
  const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_STORAGE_KEYS.accessToken) : null;
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization") && !AUTH_ROUTES.has(path)) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    const target = API_BASE_URL || "the app API proxy";
    throw new Error(`Could not reach BaseCamp backend at ${target}. Check NEXT_PUBLIC_API_BASE_URL and backend deployment.`);
  }

  if (response.status === 401 && !AUTH_ROUTES.has(path)) {
    const newToken = await doRefresh();
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      const retryResponse = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
      return parseResponse<T>(retryResponse);
    }
    clearSessionCookie();
    clearAuthSession();
    redirectToLogin();
  }

  return parseResponse<T>(response);
}

/**
 * Kicks off the backend's Spring Security oauth2Login flow for Google. The
 * backend handles the whole round trip with Google and redirects the browser
 * back to /oauth/callback with a short-lived one-time exchange code once it's
 * done - this isn't an API call, just the URL the browser should navigate to.
 */
export function getGoogleOAuthUrl(): string {
  return `${API_BASE_URL}/oauth2/authorization/google`;
}

export async function exchangeGoogleOAuthCode(code: string): Promise<AuthPayload & { newUser: boolean }> {
  let rawResponse: Response;
  try {
    rawResponse = await fetch(`${API_BASE_URL}/api/v1/auth/oauth/exchange`, {
      method: "POST",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
  } catch {
    throw new Error("Could not reach BaseCamp backend during Google sign-in. Check that the backend is running.");
  }

  const response = await parseResponse<{ auth: AuthPayload; newUser: boolean }>(rawResponse);
  if (!response.data?.auth) {
    throw new Error(response.message || "Google sign-in did not complete");
  }
  saveAuth(response.data.auth);
  return { ...response.data.auth, newUser: response.data.newUser };
}

export async function login(email: string, password: string, turnstileToken?: string | null): Promise<AuthPayload> {
  const response = await backendRequest<AuthPayload>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, turnstileToken }),
  });

  if (!response.data) {
    throw new Error(response.message || "Login failed");
  }

  saveAuth(response.data);
  return response.data;
}

export async function register(email: string, password: string, fullName: string, turnstileToken?: string | null): Promise<AuthPayload> {
  const response = await backendRequest<AuthPayload>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, fullName, turnstileToken }),
  });

  if (!response.data) {
    throw new Error(response.message || "Registration failed");
  }

  saveAuth(response.data);
  return response.data;
}

export async function logout(): Promise<void> {
  const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_STORAGE_KEYS.accessToken) : null;

  if (token) {
    try {
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // best-effort backend logout
    }
  }

  clearSessionCookie();
  clearAuthSession();
  redirectToLogin();
}

export async function getCourses(size = 12): Promise<PageResponse<CourseResponse> | null> {
  const response = await backendRequest<PageResponse<CourseResponse>>(`/api/v1/courses?size=${size}`, {
    headers: { Accept: "application/json" },
  });
  return response.data || null;
}

export async function searchCourses(title: string, size = 12): Promise<PageResponse<CourseResponse> | null> {
  const response = await backendRequest<PageResponse<CourseResponse>>(
    `/api/v1/courses/search?title=${encodeURIComponent(title)}&size=${size}`,
    { headers: { Accept: "application/json" } },
  );
  return response.data || null;
}

export async function getCourse(courseId: string): Promise<CourseResponse | null> {
  const response = await backendRequest<CourseResponse>(`/api/v1/courses/${courseId}`, {
    headers: { Accept: "application/json" },
  });
  return response.data || null;
}

export async function getCourseModules(courseId: string): Promise<ModuleResponse[]> {
  const response = await backendRequest<ModuleResponse[]>(`/api/v1/courses/${courseId}/modules`, {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}

export async function getCourseProgress(courseId: string, userId: string): Promise<CourseProgressResponse | null> {
  const response = await backendRequest<CourseProgressResponse>(
    `/api/v1/progress/course/${courseId}/user/${userId}`,
    { headers: { Accept: "application/json" } },
  );
  return response.data || null;
}

export async function getCourseAssessments(courseId: string): Promise<AssessmentResponse[]> {
  const response = await backendRequest<AssessmentResponse[]>(`/api/v1/assessments/course/${courseId}`, {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}

export type LessonProgressResponse = {
  id: string;
  lessonId: string;
  lessonTitle?: string | null;
  completed: boolean;
  timeSpentMinutes?: number | null;
  completedAt?: string | null;
};

export async function getLessonsProgress(userId: string, lessonIds: string[]): Promise<LessonProgressResponse[]> {
  if (!lessonIds.length) return [];
  const query = lessonIds.map((id) => `lessonIds=${id}`).join("&");
  const response = await backendRequest<LessonProgressResponse[]>(`/api/v1/progress/lessons/user/${userId}?${query}`, {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}

export async function updateCourseProgress(
  courseId: string,
  userId: string,
  payload: { lessonId: string; completed: boolean; timeSpentMinutes?: number },
): Promise<CourseProgressResponse | null> {
  const response = await backendRequest<CourseProgressResponse>(
    `/api/v1/progress/course/${courseId}/user/${userId}`,
    { method: "PUT", body: JSON.stringify(payload) },
  );
  return response.data || null;
}

export type EnrollmentResponse = {
  id: string;
  userId: string;
  userName?: string | null;
  courseId: string;
  courseTitle?: string | null;
  courseThumbnail?: string | null;
  status?: string | null;
  dueDate?: string | null;
  enrolledDate?: string | null;
  completedDate?: string | null;
};

export async function getMyEnrollments(userId: string): Promise<EnrollmentResponse[]> {
  const response = await backendRequest<EnrollmentResponse[]>(`/api/v1/enrollments/user/${userId}`, {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}

export async function getGlobalSearch(query: string, size = 12): Promise<SearchResponse | null> {
  const response = await backendRequest<SearchResponse>(
    `/api/v1/search?query=${encodeURIComponent(query)}&size=${size}`,
    { headers: { Accept: "application/json" } },
  );
  return response.data || null;
}

export async function getCurrentUser(): Promise<UserResponse | null> {
  const response = await backendRequest<UserResponse>("/api/v1/users/me", {
    headers: { Accept: "application/json" },
  });
  return response.data || null;
}

export async function updateCurrentUser(payload: {
  fullName?: string;
  phone?: string;
  bio?: string;
  dateOfBirth?: string;
  address?: string;
}): Promise<UserResponse | null> {
  const response = await backendRequest<UserResponse>("/api/v1/users/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function getCurrentUserSettings(): Promise<UserSettingsResponse | null> {
  const response = await backendRequest<UserSettingsResponse>("/api/v1/users/me/settings", {
    headers: { Accept: "application/json" },
  });
  return response.data || null;
}

export async function updateCurrentUserSettings(payload: {
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  timezone: string;
}): Promise<UserSettingsResponse | null> {
  const response = await backendRequest<UserSettingsResponse>("/api/v1/users/me/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function getPublicDashboard(): Promise<PublicDashboardResponse | null> {
  const response = await backendRequest<PublicDashboardResponse>("/api/v1/dashboard/public", {
    headers: { Accept: "application/json" },
  });
  return response.data || null;
}

export async function getLesson(lessonId: string): Promise<LessonResponse | null> {
  const response = await backendRequest<LessonResponse>(`/api/v1/courses/lessons/${lessonId}`, {
    headers: { Accept: "application/json" },
  });
  return response.data || null;
}

export type ReadingContentResponse = {
  id: string;
  title: string;
  contentHtml?: string | null;
  contentMarkdown?: string | null;
  estimatedReadingMinutes?: number | null;
  lessonId?: string | null;
};

export async function getLessonReadingContent(lessonId: string): Promise<ReadingContentResponse | null> {
  try {
    const response = await backendRequest<ReadingContentResponse>(`/api/v1/courses/lessons/${lessonId}/reading-content`, {
      headers: { Accept: "application/json" },
    });
    return response.data || null;
  } catch {
    return null;
  }
}

export async function getAssessment(assessmentId: string): Promise<AssessmentResponse | null> {
  const response = await backendRequest<AssessmentResponse>(`/api/v1/assessments/${assessmentId}`, {
    headers: { Accept: "application/json" },
  });
  return response.data || null;
}

export async function submitAssessment(payload: {
  assessmentId: string;
  answers: Array<{
    questionId: string;
    answerText?: string | null;
    selectedOptionId?: string | null;
  }>;
}): Promise<AssessmentResultResponse | null> {
  const response = await backendRequest<AssessmentResultResponse>("/api/v1/assessments/submit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function getCertificates(): Promise<CertificateResponse[]> {
  const response = await backendRequest<CertificateResponse[]>("/api/v1/certificates/my-certificates", {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}

export async function downloadCertificate(certificateId: string): Promise<Blob> {
  return backendFetchBlob(`/api/v1/certificates/${certificateId}/download`);
}

export async function verifyCertificate(certificateNumber: string): Promise<CertificateResponse | null> {
  const response = await backendRequest<CertificateResponse>(
    `/api/v1/certificates/verify/${encodeURIComponent(certificateNumber)}`,
    { headers: { Accept: "application/json" } },
  );
  return response.data || null;
}

export async function getNotifications(): Promise<NotificationResponse[]> {
  const response = await backendRequest<NotificationResponse[]>("/api/v1/notifications/my-notifications", {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await backendRequest<number>("/api/v1/notifications/unread-count", {
    headers: { Accept: "application/json" },
  });
  return response.data || 0;
}

export async function markNotificationRead(notificationId: string): Promise<NotificationResponse | null> {
  const response = await backendRequest<NotificationResponse>(`/api/v1/notifications/${notificationId}/read`, {
    method: "PUT",
  });
  return response.data || null;
}

export async function markAllNotificationsRead(): Promise<void> {
  await backendRequest<void>("/api/v1/notifications/read-all", { method: "PUT" });
}

export async function deleteNotification(notificationId: string): Promise<void> {
  await backendRequest<void>(`/api/v1/notifications/${notificationId}`, { method: "DELETE" });
}

export async function forgotPassword(email: string, turnstileToken?: string | null): Promise<void> {
  await backendRequest<void>("/api/v1/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email, turnstileToken }),
  });
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await backendRequest<void>("/api/v1/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await backendRequest<void>("/api/v1/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function verifyOtp(email: string, otp: string): Promise<void> {
  await backendRequest<void>("/api/v1/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

export function saveAuth(payload: AuthPayload): void {
  localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, payload.accessToken);
  localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, payload.refreshToken);
  localStorage.setItem(AUTH_STORAGE_KEYS.email, payload.email);
  localStorage.setItem(AUTH_STORAGE_KEYS.role, payload.role);
  localStorage.setItem(AUTH_STORAGE_KEYS.fullName, payload.fullName || "");
  setSessionCookie();
}

export function getAuthSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const accessToken = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
  if (!accessToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken: localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken) || "",
    email: localStorage.getItem(AUTH_STORAGE_KEYS.email) || "",
    role: localStorage.getItem(AUTH_STORAGE_KEYS.role) || "",
    fullName: localStorage.getItem(AUTH_STORAGE_KEYS.fullName) || "",
  };
}

export function clearAuthSession(): void {
  Object.values(AUTH_STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  clearSessionCookie();
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export type NoteResponse = {
  id: string;
  courseId: string;
  courseTitle?: string | null;
  lessonId?: string | null;
  lessonTitle?: string | null;
  content: string;
  timestampSeconds?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export async function getMyNotes(courseId?: string, lessonId?: string): Promise<NoteResponse[]> {
  const params = new URLSearchParams();
  if (courseId) params.set("courseId", courseId);
  if (lessonId) params.set("lessonId", lessonId);
  const query = params.toString();
  const response = await backendRequest<NoteResponse[]>(`/api/v1/notes${query ? `?${query}` : ""}`, {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}

export async function createNote(payload: { courseId: string; lessonId?: string; content: string; timestampSeconds?: number }): Promise<NoteResponse | null> {
  const response = await backendRequest<NoteResponse>("/api/v1/notes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function updateNote(noteId: string, content: string): Promise<NoteResponse | null> {
  const response = await backendRequest<NoteResponse>(`/api/v1/notes/${noteId}`, {
    method: "PUT",
    body: JSON.stringify({ content }),
  });
  return response.data || null;
}

export async function deleteNote(noteId: string): Promise<void> {
  await backendRequest<void>(`/api/v1/notes/${noteId}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Bookmarks
// ---------------------------------------------------------------------------

export type BookmarkResponse = {
  id: string;
  courseId: string;
  courseTitle?: string | null;
  lessonId: string;
  lessonTitle?: string | null;
  createdAt?: string | null;
};

export async function getMyBookmarks(): Promise<BookmarkResponse[]> {
  const response = await backendRequest<BookmarkResponse[]>("/api/v1/bookmarks", {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}

export async function createBookmark(courseId: string, lessonId: string): Promise<BookmarkResponse | null> {
  const response = await backendRequest<BookmarkResponse>("/api/v1/bookmarks", {
    method: "POST",
    body: JSON.stringify({ courseId, lessonId }),
  });
  return response.data || null;
}

export async function deleteBookmark(lessonId: string): Promise<void> {
  await backendRequest<void>(`/api/v1/bookmarks/lesson/${lessonId}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Course discussion
// ---------------------------------------------------------------------------

export type DiscussionPostResponse = {
  id: string;
  courseId: string;
  userId: string;
  userName?: string | null;
  parentId?: string | null;
  content: string;
  createdAt?: string | null;
};

export async function getDiscussionPosts(courseId: string): Promise<DiscussionPostResponse[]> {
  const response = await backendRequest<DiscussionPostResponse[]>(`/api/v1/discussions?courseId=${courseId}`, {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}

export async function createDiscussionPost(courseId: string, content: string, parentId?: string): Promise<DiscussionPostResponse | null> {
  const response = await backendRequest<DiscussionPostResponse>("/api/v1/discussions", {
    method: "POST",
    body: JSON.stringify({ courseId, content, parentId }),
  });
  return response.data || null;
}

export async function deleteDiscussionPost(postId: string): Promise<void> {
  await backendRequest<void>(`/api/v1/discussions/${postId}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Assignment submissions
// ---------------------------------------------------------------------------

export type AssignmentSubmissionResponse = {
  id: string;
  lessonId: string;
  submissionText?: string | null;
  fileUrl?: string | null;
  status: "SUBMITTED" | "GRADED";
  score?: number | null;
  feedback?: string | null;
  gradedByName?: string | null;
  gradedAt?: string | null;
  createdAt?: string | null;
};

export async function getMyAssignmentSubmission(lessonId: string): Promise<AssignmentSubmissionResponse | null> {
  const response = await backendRequest<AssignmentSubmissionResponse>(`/api/v1/assignments/${lessonId}/my-submission`, {
    headers: { Accept: "application/json" },
  });
  return response.data || null;
}

export async function submitAssignment(lessonId: string, text?: string, file?: File): Promise<AssignmentSubmissionResponse | null> {
  const formData = new FormData();
  if (text) formData.set("text", text);
  if (file) formData.set("file", file);
  const response = await backendRequest<AssignmentSubmissionResponse>(`/api/v1/assignments/${lessonId}/submit`, {
    method: "POST",
    body: formData,
  });
  return response.data || null;
}

// ---------------------------------------------------------------------------
// Contests
// ---------------------------------------------------------------------------

export type ContestResponse = {
  id: string;
  title: string;
  description?: string | null;
  assessmentId: string;
  assessmentTitle?: string | null;
  courseId: string;
  courseTitle?: string | null;
  startAt: string;
  endAt: string;
  status: "UPCOMING" | "ACTIVE" | "ENDED";
};

export type LeaderboardEntryResponse = {
  rank: number;
  userId: string;
  userName?: string | null;
  score?: number | null;
  submittedAt?: string | null;
};

export async function getActiveContests(courseId: string): Promise<ContestResponse[]> {
  const response = await backendRequest<ContestResponse[]>(`/api/v1/contests/active?courseId=${courseId}`, {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}

export async function getContestLeaderboard(contestId: string): Promise<LeaderboardEntryResponse[]> {
  const response = await backendRequest<LeaderboardEntryResponse[]>(`/api/v1/contests/${contestId}/leaderboard`, {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}
