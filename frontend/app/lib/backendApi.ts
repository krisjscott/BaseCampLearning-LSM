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

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081").replace(/\/$/, "");

async function parseResponse<T>(response: Response): Promise<ApiEnvelope<T>> {
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

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

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  return parseResponse<T>(response);
}

export async function login(email: string, password: string): Promise<AuthPayload> {
  const response = await backendRequest<AuthPayload>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!response.data) {
    throw new Error(response.message || "Login failed");
  }

  saveAuth(response.data);
  return response.data;
}

export async function register(email: string, password: string, fullName: string): Promise<AuthPayload> {
  const response = await backendRequest<AuthPayload>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, fullName }),
  });

  if (!response.data) {
    throw new Error(response.message || "Registration failed");
  }

  saveAuth(response.data);
  return response.data;
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
}
