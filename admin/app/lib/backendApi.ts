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

function setSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}

function redirectToLogin(): void {
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
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
          "Backend rejected this browser origin. Add the admin app origin to backend CORS_ALLOWED_ORIGINS and restart the backend.",
        );
      }
      if (!response.ok) {
        throw new Error(serverText || `Backend request failed: ${response.status} ${response.statusText}`);
      }
      throw new Error(`Invalid JSON response from backend: ${response.status} ${response.statusText}`);
    }
  }

  if (!response.ok) {
    throw new Error(body?.message || response.statusText || "Backend request failed");
  }

  return body as ApiEnvelope<T>;
}

/** For endpoints that stream a binary file (e.g. a rendered PDF) instead of the usual JSON envelope. */
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

export async function getCurrentUser(): Promise<UserResponse | null> {
  const response = await backendRequest<UserResponse>("/api/v1/users/me", {
    headers: { Accept: "application/json" },
  });
  return response.data || null;
}

export async function forgotPassword(email: string): Promise<void> {
  await backendRequest<void>("/api/v1/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await backendRequest<void>("/api/v1/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await backendRequest<void>("/api/v1/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
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
