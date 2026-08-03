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
  contentType?: string | null;
  durationMinutes?: number | null;
  orderIndex?: number | null;
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
const API_BASE_URL = configuredApiBaseUrl ? configuredApiBaseUrl.replace(/\/$/, "") : "";

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
  if (typeof window !== "undefined" && window.location.pathname !== "/") {
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
      console.error("Failed to parse JSON response:", text.substring(0, 200));
      throw new Error(`Invalid response from server: ${response.status} ${response.statusText}`);
    }
  }

  if (!response.ok) {
    throw new Error(body?.message || response.statusText || "Backend request failed");
  }

  return body as ApiEnvelope<T>;
}

export async function backendRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiEnvelope<T>> {
  const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_STORAGE_KEYS.accessToken) : null;
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
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
  const email = typeof window !== "undefined"
    ? localStorage.getItem(AUTH_STORAGE_KEYS.email)
    : null;

  clearSessionCookie();
  clearAuthSession();

  if (email) {
    try {
      await fetch(`${API_BASE_URL}/api/v1/auth/logout?email=${encodeURIComponent(email)}`, {
        method: "POST",
      });
    } catch {
      // best-effort backend logout
    }
  }

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

export async function getNotifications(): Promise<NotificationResponse[]> {
  const response = await backendRequest<NotificationResponse[]>("/api/v1/notifications/my-notifications", {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
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
