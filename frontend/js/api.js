const STORAGE_KEYS = {
  baseUrl: "bc_base_url",
  accessToken: "bc_access_token",
  refreshToken: "bc_refresh_token",
  email: "bc_email",
  role: "bc_role",
  fullName: "bc_full_name",
  userId: "bc_user_id",
};

const Api = {
  getBaseUrl() {
    return localStorage.getItem(STORAGE_KEYS.baseUrl) || "http://localhost:8081";
  },

  setBaseUrl(url) {
    localStorage.setItem(STORAGE_KEYS.baseUrl, url.replace(/\/$/, ""));
  },

  getSession() {
    return {
      accessToken: localStorage.getItem(STORAGE_KEYS.accessToken) || "",
      refreshToken: localStorage.getItem(STORAGE_KEYS.refreshToken) || "",
      email: localStorage.getItem(STORAGE_KEYS.email) || "",
      role: localStorage.getItem(STORAGE_KEYS.role) || "",
      fullName: localStorage.getItem(STORAGE_KEYS.fullName) || "",
      userId: localStorage.getItem(STORAGE_KEYS.userId) || "",
    };
  },

  saveAuth(data = {}) {
    if (data.accessToken != null) localStorage.setItem(STORAGE_KEYS.accessToken, data.accessToken);
    if (data.refreshToken != null) localStorage.setItem(STORAGE_KEYS.refreshToken, data.refreshToken);
    if (data.email != null) localStorage.setItem(STORAGE_KEYS.email, data.email);
    if (data.role != null) localStorage.setItem(STORAGE_KEYS.role, data.role);
    if (data.fullName != null) localStorage.setItem(STORAGE_KEYS.fullName, data.fullName || "");
    if (data.userId != null) localStorage.setItem(STORAGE_KEYS.userId, data.userId || "");
  },

  clearAuth() {
    [
      STORAGE_KEYS.accessToken,
      STORAGE_KEYS.refreshToken,
      STORAGE_KEYS.email,
      STORAGE_KEYS.role,
      STORAGE_KEYS.fullName,
      STORAGE_KEYS.userId,
    ].forEach((k) => localStorage.removeItem(k));
  },

  async request(method, path, { body, query, auth = true, headers = {} } = {}) {
    const url = new URL(this.getBaseUrl() + path);
    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        if (Array.isArray(v)) v.forEach((item) => url.searchParams.append(k, item));
        else url.searchParams.set(k, v);
      });
    }

    const finalHeaders = { ...headers };
    if (body !== undefined) finalHeaders["Content-Type"] = "application/json";
    if (auth) {
      const token = this.getSession().accessToken;
      if (token) finalHeaders.Authorization = `Bearer ${token}`;
    }

    const started = performance.now();
    let response;
    let text = "";
    let data = null;
    let error = null;

    try {
      response = await fetch(url.toString(), {
        method,
        headers: finalHeaders,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }
    } catch (e) {
      error = e;
    }

    const result = {
      ok: !!response && response.ok,
      status: response ? response.status : 0,
      statusText: response ? response.statusText : "NETWORK_ERROR",
      method,
      url: url.toString(),
      durationMs: Math.round(performance.now() - started),
      data,
      raw: text,
      error: error ? String(error.message || error) : null,
    };

    if (typeof window.onApiResult === "function") window.onApiResult(result);
    return result;
  },

  get(path, opts) {
    return this.request("GET", path, opts);
  },
  post(path, opts) {
    return this.request("POST", path, opts);
  },
  put(path, opts) {
    return this.request("PUT", path, opts);
  },
  del(path, opts) {
    return this.request("DELETE", path, opts);
  },
};

window.Api = Api;
window.STORAGE_KEYS = STORAGE_KEYS;
