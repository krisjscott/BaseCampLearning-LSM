const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function setVal(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value ?? "";
}

function numOrUndef(id) {
  const v = val(id);
  if (v === "") return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

function boolFrom(id) {
  const el = document.getElementById(id);
  return !!(el && el.checked);
}

function pick(obj, keys) {
  const out = {};
  keys.forEach((k) => {
    const v = obj[k];
    if (v !== undefined && v !== null && v !== "") out[k] = v;
  });
  return out;
}

function showResponse(result) {
  const statusEl = $("#response-status");
  const metaEl = $("#response-meta");
  const bodyEl = $("#response-body");
  if (!statusEl || !metaEl || !bodyEl) return;

  const ok = result.ok;
  statusEl.textContent = result.error
    ? `ERROR · ${result.error}`
    : `${result.status} ${result.statusText}`;
  statusEl.className = ok ? "ok" : "err";

  metaEl.innerHTML = `
    <div><strong>${result.method}</strong> ${escapeHtml(result.url)}</div>
    <div>${result.durationMs} ms</div>
  `;

  const pretty =
    typeof result.data === "string"
      ? result.data
      : JSON.stringify(result.data, null, 2) || "(empty body)";
  bodyEl.textContent = pretty;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderSession() {
  const s = Api.getSession();
  $("#session-name").textContent = s.fullName || s.email || "Not signed in";
  $("#session-role").textContent = s.role || "—";
  $("#session-user-id").textContent = s.userId || "—";
  $("#session-email").textContent = s.email || "—";
  $("#btn-logout").classList.toggle("hidden", !s.accessToken);
  $("#auth-badge").textContent = s.accessToken ? "JWT stored" : "No token";
}

function navigate(viewId) {
  $$(".view").forEach((v) => v.classList.toggle("active", v.id === `view-${viewId}`));
  $$(".nav button[data-view]").forEach((b) =>
    b.classList.toggle("active", b.dataset.view === viewId)
  );
  location.hash = viewId;
  if (typeof window[`onEnter_${viewId}`] === "function") {
    window[`onEnter_${viewId}`]();
  }
}

function renderList(container, items, mapper) {
  if (!container) return;
  if (!items || !items.length) {
    container.innerHTML = `<div class="empty">No items</div>`;
    return;
  }
  container.innerHTML = items.map(mapper).join("");
}

function courseCard(c) {
  return `
    <div class="list-item" data-course-id="${c.id || ""}">
      <div class="img-ph sm">thumb</div>
      <div>
        <h4>${escapeHtml(c.title || "Untitled")}</h4>
        <p>${escapeHtml(c.description || "No description")}</p>
        <div class="meta">
          <span>${escapeHtml(c.status || "—")}</span>
          <span>${escapeHtml(c.visibility || "—")}</span>
          <span>${c.durationHours != null ? c.durationHours + "h" : "—"}</span>
          <span>${escapeHtml(c.instructorName || "instructor?")}</span>
        </div>
      </div>
      <div class="actions">
        <button class="btn" data-action="open-course" data-id="${c.id || ""}">Open</button>
        <button class="btn" data-action="enroll-course" data-id="${c.id || ""}">Enroll</button>
      </div>
    </div>
  `;
}

/* ---------- Auth ---------- */
async function doRegister() {
  const body = {
    email: val("reg-email"),
    password: val("reg-password"),
    fullName: val("reg-fullname"),
  };
  const res = await Api.post("/api/v1/auth/register", { body, auth: false });
  if (res.ok && res.data?.data) {
    Api.saveAuth(res.data.data);
    await hydrateUserId();
    renderSession();
  }
}

async function doLogin() {
  const body = {
    email: val("login-email"),
    password: val("login-password"),
  };
  const res = await Api.post("/api/v1/auth/login", { body, auth: false });
  if (res.ok && res.data?.data) {
    Api.saveAuth(res.data.data);
    await hydrateUserId();
    renderSession();
  }
}

async function doRefresh() {
  const refreshToken = Api.getSession().refreshToken;
  const res = await Api.post("/api/v1/auth/refresh", {
    body: { refreshToken },
    auth: false,
  });
  if (res.ok && res.data?.data) {
    const d = res.data.data;
    Api.saveAuth({
      accessToken: d.accessToken || d.token || Api.getSession().accessToken,
      refreshToken: d.refreshToken || refreshToken,
    });
    renderSession();
  }
}

async function doLogout() {
  const email = Api.getSession().email || val("login-email");
  await Api.post("/api/v1/auth/logout", { query: { email }, auth: false });
  Api.clearAuth();
  renderSession();
}

async function doForgot() {
  await Api.post("/api/v1/auth/forgot-password", {
    body: { email: val("login-email") },
    auth: false,
  });
}

async function hydrateUserId() {
  const res = await Api.get("/api/v1/users/me");
  if (res.ok && res.data?.data?.id) {
    Api.saveAuth({
      userId: res.data.data.id,
      fullName: res.data.data.fullName || Api.getSession().fullName,
      email: res.data.data.email || Api.getSession().email,
      role: res.data.data.role || Api.getSession().role,
    });
    setVal("ctx-user-id", res.data.data.id);
  }
}

/* ---------- Learner ---------- */
async function loadPublicDashboard() {
  const res = await Api.get("/api/v1/dashboard/public", { auth: false });
  const d = res.data?.data || {};
  $("#kpi-public").innerHTML = Object.entries(d)
    .map(
      ([k, v]) =>
        `<div class="kpi"><div class="label">${escapeHtml(k)}</div><div class="value">${escapeHtml(
          typeof v === "object" ? JSON.stringify(v) : v
        )}</div></div>`
    )
    .join("") || `<div class="empty">No public dashboard fields</div>`;
}

async function loadEmployeeDashboard() {
  const res = await Api.get("/api/v1/dashboard/employee");
  const d = res.data?.data || {};
  $("#kpi-employee").innerHTML = Object.entries(d)
    .map(
      ([k, v]) =>
        `<div class="kpi"><div class="label">${escapeHtml(k)}</div><div class="value">${escapeHtml(
          typeof v === "object" ? JSON.stringify(v) : v
        )}</div></div>`
    )
    .join("") || `<div class="empty">No employee dashboard fields</div>`;
}

async function loadCatalog() {
  const res = await Api.get("/api/v1/courses", {
    query: { page: 0, size: 20 },
    auth: false,
  });
  const page = res.data?.data || {};
  const items = page.content || page || [];
  renderList($("#catalog-list"), Array.isArray(items) ? items : [], courseCard);
}

async function searchCourses() {
  const title = val("catalog-search");
  const res = await Api.get("/api/v1/courses/search", {
    query: { title, page: 0, size: 20 },
    auth: false,
  });
  const page = res.data?.data || {};
  const items = page.content || [];
  renderList($("#catalog-list"), items, courseCard);
}

async function globalSearch() {
  const res = await Api.get("/api/v1/search", {
    query: {
      query: val("global-search-q"),
      type: val("global-search-type") || undefined,
      page: 0,
      size: 20,
    },
    auth: false,
  });
  const data = res.data?.data;
  $("#search-results").textContent = JSON.stringify(data, null, 2) || "No results";
}

async function openCourse(id) {
  if (!id) id = val("course-id");
  if (!id) return;
  setVal("course-id", id);
  setVal("ctx-course-id", id);
  const res = await Api.get(`/api/v1/courses/${id}`, { auth: false });
  const c = res.data?.data || {};
  $("#course-detail-title").textContent = c.title || "Course";
  $("#course-detail-desc").textContent = c.description || "—";
  $("#course-detail-meta").innerHTML = `
    <span>${escapeHtml(c.status || "—")}</span>
    <span>${escapeHtml(c.visibility || "—")}</span>
    <span>${escapeHtml(c.categoryName || "category?")}</span>
    <span>${escapeHtml(c.instructorName || "instructor?")}</span>
    <span>id: ${escapeHtml(c.id || id)}</span>
  `;
  await loadModules(id);
  await loadCourseAssessments(id);
  navigate("course");
}

async function loadModules(courseId) {
  courseId = courseId || val("course-id");
  const res = await Api.get(`/api/v1/courses/${courseId}/modules`, { auth: false });
  const modules = res.data?.data || [];
  const box = $("#module-list");
  if (!Array.isArray(modules) || !modules.length) {
    box.innerHTML = `<div class="empty">No modules</div>`;
    return;
  }
  box.innerHTML = "";
  for (const m of modules) {
    const lessonsRes = await Api.get(`/api/v1/courses/modules/${m.id}/lessons`, { auth: false });
    const lessons = lessonsRes.data?.data || [];
    const lessonHtml = (Array.isArray(lessons) ? lessons : [])
      .map(
        (l) => `
        <tr>
          <td>${escapeHtml(l.title || "")}</td>
          <td>${escapeHtml(l.contentType || "")}</td>
          <td>${l.durationMinutes ?? "—"}</td>
          <td><button class="btn" data-action="open-lesson" data-id="${l.id}" data-module="${m.id}">Open lesson</button></td>
        </tr>`
      )
      .join("");
    box.innerHTML += `
      <div class="outline">
        <strong>${escapeHtml(m.title || "Module")}</strong>
        <span class="badge">${escapeHtml(m.id || "")}</span>
        <p class="help">${escapeHtml(m.description || "")}</p>
        <table class="table">
          <thead><tr><th>Lesson</th><th>Type</th><th>Min</th><th></th></tr></thead>
          <tbody>${lessonHtml || `<tr><td colspan="4" class="empty">No lessons</td></tr>`}</tbody>
        </table>
      </div>`;
  }
}

async function openLesson(id) {
  if (!id) id = val("lesson-id");
  if (!id) return;
  setVal("lesson-id", id);
  setVal("ctx-lesson-id", id);
  const res = await Api.get(`/api/v1/courses/lessons/${id}`, { auth: false });
  const l = res.data?.data || {};
  $("#lesson-title").textContent = l.title || "Lesson";
  $("#lesson-meta").innerHTML = `
    <span>${escapeHtml(l.contentType || "—")}</span>
    <span>${l.durationMinutes ?? "—"} min</span>
    <span>id: ${escapeHtml(l.id || id)}</span>
  `;
  $("#lesson-desc").textContent = l.description || "—";
  navigate("lesson");
}

async function enrollSelf() {
  const userId = Api.getSession().userId || val("ctx-user-id");
  const courseId = val("course-id") || val("ctx-course-id");
  await Api.post("/api/v1/enrollments", {
    body: {
      userId,
      courseId,
      dueDate: val("enroll-due") || undefined,
    },
  });
}

async function loadMyEnrollments() {
  const userId = Api.getSession().userId || val("ctx-user-id");
  const res = await Api.get(`/api/v1/enrollments/user/${userId}`);
  const items = res.data?.data || [];
  renderList(
    $("#enrollment-list"),
    Array.isArray(items) ? items : [],
    (e) => `
      <div class="list-item">
        <div class="img-ph sm">course</div>
        <div>
          <h4>Enrollment ${escapeHtml(e.id || "")}</h4>
          <p>course: ${escapeHtml(e.courseId || e.course?.id || "—")} · status: ${escapeHtml(
      e.status || "—"
    )}</p>
        </div>
        <div class="actions">
          <button class="btn" data-action="open-course" data-id="${e.courseId || e.course?.id || ""}">Open</button>
        </div>
      </div>`
  );
}

async function loadProgress() {
  const userId = Api.getSession().userId || val("ctx-user-id");
  const courseId = val("ctx-course-id") || val("course-id");
  const res = await Api.get(`/api/v1/progress/course/${courseId}/user/${userId}`);
  $("#progress-summary").textContent = JSON.stringify(res.data?.data, null, 2) || "—";
}

async function updateProgress() {
  const userId = Api.getSession().userId || val("ctx-user-id");
  const courseId = val("ctx-course-id") || val("course-id");
  await Api.put(`/api/v1/progress/course/${courseId}/user/${userId}`, {
    body: {
      lessonId: val("ctx-lesson-id") || val("lesson-id"),
      completed: boolFrom("progress-completed"),
      timeSpentMinutes: numOrUndef("progress-minutes"),
    },
  });
  await loadProgress();
}

async function loadResume() {
  const userId = Api.getSession().userId || val("ctx-user-id");
  const courseId = val("ctx-course-id") || val("course-id");
  const res = await Api.get(`/api/v1/progress/course/${courseId}/user/${userId}/resume`);
  $("#progress-summary").textContent = JSON.stringify(res.data?.data, null, 2) || "—";
}

async function loadCourseAssessments(courseId) {
  courseId = courseId || val("ctx-course-id") || val("course-id");
  const res = await Api.get(`/api/v1/assessments/course/${courseId}`);
  const items = res.data?.data || [];
  renderList(
    $("#assessment-list"),
    Array.isArray(items) ? items : [],
    (a) => `
      <div class="list-item">
        <div class="img-ph sm">quiz</div>
        <div>
          <h4>${escapeHtml(a.title || "Assessment")}</h4>
          <p>${escapeHtml(a.type || "")} · pass ${a.passingScore ?? "—"} · attempts ${
      a.maxAttempts ?? "—"
    }</p>
          <p class="help">${escapeHtml(a.id || "")}</p>
        </div>
        <div class="actions">
          <button class="btn" data-action="load-assessment" data-id="${a.id}">Load</button>
        </div>
      </div>`
  );
}

async function loadAssessment(id) {
  id = id || val("assessment-id");
  if (!id) return;
  setVal("assessment-id", id);
  setVal("ctx-assessment-id", id);
  const res = await Api.get(`/api/v1/assessments/${id}`);
  const a = res.data?.data || {};
  $("#assessment-title").textContent = a.title || "Assessment";
  $("#assessment-detail").textContent = JSON.stringify(a, null, 2);
  navigate("quiz");
}

async function submitAssessment() {
  let answers = [];
  try {
    answers = JSON.parse(val("quiz-answers-json") || "[]");
  } catch {
    alert("quiz answers must be valid JSON array");
    return;
  }
  const userId = Api.getSession().userId || val("ctx-user-id");
  await Api.post("/api/v1/assessments/submit", {
    query: { userId },
    body: {
      assessmentId: val("assessment-id") || val("ctx-assessment-id"),
      answers,
    },
  });
}

async function loadCertificates() {
  const res = await Api.get("/api/v1/certificates/my-certificates");
  const items = res.data?.data || [];
  renderList(
    $("#cert-list"),
    Array.isArray(items) ? items : [],
    (c) => `
      <div class="list-item">
        <div class="img-ph sm">cert</div>
        <div>
          <h4>${escapeHtml(c.certificateNumber || c.id || "Certificate")}</h4>
          <p>${escapeHtml(c.courseTitle || "")} · ${escapeHtml(c.issuedDate || "")}</p>
        </div>
        <div class="actions">
          <button class="btn" data-action="download-cert" data-id="${c.id}">Download</button>
        </div>
      </div>`
  );
}

async function verifyCertificate() {
  const n = val("cert-number");
  await Api.get(`/api/v1/certificates/verify/${encodeURIComponent(n)}`, { auth: false });
}

async function downloadCertificate(id) {
  await Api.get(`/api/v1/certificates/${id}/download`);
}

async function loadNotifications() {
  const res = await Api.get("/api/v1/notifications/my-notifications");
  const items = res.data?.data || [];
  renderList(
    $("#notif-list"),
    Array.isArray(items) ? items : [],
    (n) => `
      <div class="list-item">
        <div class="img-ph sm">bell</div>
        <div>
          <h4>${escapeHtml(n.title || n.type || "Notification")}</h4>
          <p>${escapeHtml(n.message || n.body || "")}</p>
        </div>
        <div class="actions">
          <button class="btn" data-action="read-notif" data-id="${n.id}">Mark read</button>
          <button class="btn danger" data-action="del-notif" data-id="${n.id}">Delete</button>
        </div>
      </div>`
  );
  const count = await Api.get("/api/v1/notifications/unread-count");
  $("#notif-unread").textContent = count.data?.data ?? "—";
}

async function loadProfile() {
  const res = await Api.get("/api/v1/users/me");
  const u = res.data?.data || {};
  setVal("profile-name", u.fullName || "");
  setVal("profile-phone", u.phone || "");
  setVal("profile-bio", u.bio || "");
  setVal("profile-dob", u.dateOfBirth || "");
  setVal("profile-address", u.address || "");
  $("#profile-meta").textContent = JSON.stringify(u, null, 2);
  if (u.id) {
    Api.saveAuth({ userId: u.id, fullName: u.fullName, email: u.email, role: u.role });
    setVal("ctx-user-id", u.id);
    renderSession();
  }
}

async function saveProfile() {
  await Api.put("/api/v1/users/me", {
    body: pick(
      {
        fullName: val("profile-name"),
        phone: val("profile-phone"),
        bio: val("profile-bio"),
        dateOfBirth: val("profile-dob") || undefined,
        address: val("profile-address"),
      },
      ["fullName", "phone", "bio", "dateOfBirth", "address"]
    ),
  });
  await loadProfile();
}

/* ---------- Admin ---------- */
async function createCourse() {
  const instructorId = val("admin-instructor-id") || Api.getSession().userId || val("ctx-user-id");
  const body = pick(
    {
      title: val("admin-course-title"),
      description: val("admin-course-desc"),
      thumbnailUrl: val("admin-course-thumb") || undefined,
      categoryId: val("admin-course-category") || undefined,
      organizationId: val("admin-course-org") || undefined,
      visibility: val("admin-course-visibility") || undefined,
      durationHours: numOrUndef("admin-course-hours"),
      price: numOrUndef("admin-course-price"),
    },
    [
      "title",
      "description",
      "thumbnailUrl",
      "categoryId",
      "organizationId",
      "visibility",
      "durationHours",
      "price",
    ]
  );
  const res = await Api.post("/api/v1/courses", {
    body,
    query: { instructorId },
  });
  if (res.ok && res.data?.data?.id) {
    setVal("ctx-course-id", res.data.data.id);
    setVal("admin-module-course-id", res.data.data.id);
  }
}

async function createModule() {
  const body = {
    title: val("admin-module-title"),
    description: val("admin-module-desc"),
    orderIndex: numOrUndef("admin-module-order"),
    courseId: val("admin-module-course-id") || val("ctx-course-id"),
  };
  const res = await Api.post("/api/v1/courses/modules", { body });
  if (res.ok && res.data?.data?.id) {
    setVal("ctx-module-id", res.data.data.id);
    setVal("admin-lesson-module-id", res.data.data.id);
  }
}

async function createLesson() {
  const body = pick(
    {
      title: val("admin-lesson-title"),
      description: val("admin-lesson-desc"),
      contentUrl: val("admin-lesson-url") || undefined,
      contentType: val("admin-lesson-type") || undefined,
      durationMinutes: numOrUndef("admin-lesson-minutes"),
      orderIndex: numOrUndef("admin-lesson-order"),
      moduleId: val("admin-lesson-module-id") || val("ctx-module-id"),
    },
    [
      "title",
      "description",
      "contentUrl",
      "contentType",
      "durationMinutes",
      "orderIndex",
      "moduleId",
    ]
  );
  const res = await Api.post("/api/v1/courses/lessons", { body });
  if (res.ok && res.data?.data?.id) setVal("ctx-lesson-id", res.data.data.id);
}

async function publishCourse() {
  const id = val("admin-publish-course-id") || val("ctx-course-id");
  await Api.post(`/api/v1/courses/${id}/publish`);
}

async function archiveCourse() {
  const id = val("admin-publish-course-id") || val("ctx-course-id");
  await Api.post(`/api/v1/courses/${id}/archive`);
}

async function createCategory() {
  await Api.post("/api/v1/courses/categories", {
    body: {
      name: val("admin-cat-name"),
      description: val("admin-cat-desc") || undefined,
      parentId: val("admin-cat-parent") || undefined,
    },
  });
}

async function createAssessment() {
  const body = pick(
    {
      title: val("admin-assess-title"),
      description: val("admin-assess-desc"),
      courseId: val("admin-assess-course-id") || val("ctx-course-id"),
      type: val("admin-assess-type") || undefined,
      passingScore: numOrUndef("admin-assess-pass"),
      timeLimitMinutes: numOrUndef("admin-assess-time"),
      maxAttempts: numOrUndef("admin-assess-attempts"),
    },
    [
      "title",
      "description",
      "courseId",
      "type",
      "passingScore",
      "timeLimitMinutes",
      "maxAttempts",
    ]
  );
  const res = await Api.post("/api/v1/assessments", { body });
  if (res.ok && res.data?.data?.id) {
    setVal("ctx-assessment-id", res.data.data.id);
    setVal("admin-q-assessment-id", res.data.data.id);
  }
}

async function createQuestion() {
  let options = [];
  try {
    options = JSON.parse(val("admin-q-options") || "[]");
  } catch {
    alert("options must be JSON array");
    return;
  }
  const assessmentId = val("admin-q-assessment-id") || val("ctx-assessment-id");
  await Api.post(`/api/v1/assessments/${assessmentId}/questions`, {
    body: {
      questionText: val("admin-q-text"),
      questionType: val("admin-q-type") || undefined,
      points: numOrUndef("admin-q-points"),
      orderIndex: numOrUndef("admin-q-order"),
      options,
    },
  });
}

async function assignCourse() {
  await Api.post("/api/v1/enrollments/assign", {
    body: {
      userId: val("admin-assign-user"),
      courseId: val("admin-assign-course") || val("ctx-course-id"),
      assignedById: val("admin-assign-by") || Api.getSession().userId || val("ctx-user-id"),
      dueDate: val("admin-assign-due") || undefined,
    },
  });
}

async function createLearningPath() {
  let courseIds = [];
  try {
    const raw = val("admin-path-courses");
    courseIds = raw ? JSON.parse(raw) : [];
  } catch {
    courseIds = val("admin-path-courses")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  await Api.post("/api/v1/enrollments/learning-paths", {
    body: {
      name: val("admin-path-name"),
      description: val("admin-path-desc") || undefined,
      organizationId: val("admin-path-org") || undefined,
      courseIds,
    },
  });
}

async function createOrg() {
  const res = await Api.post("/api/v1/organizations", {
    body: {
      name: val("admin-org-name"),
      description: val("admin-org-desc") || undefined,
      website: val("admin-org-web") || undefined,
    },
  });
  if (res.ok && res.data?.data?.id) {
    setVal("ctx-org-id", res.data.data.id);
    setVal("admin-dept-org", res.data.data.id);
  }
}

async function listOrgs() {
  const res = await Api.get("/api/v1/organizations");
  $("#org-list").textContent = JSON.stringify(res.data?.data, null, 2);
}

async function createDepartment() {
  const res = await Api.post("/api/v1/organizations/departments", {
    body: {
      name: val("admin-dept-name"),
      description: val("admin-dept-desc") || undefined,
      organizationId: val("admin-dept-org") || val("ctx-org-id"),
    },
  });
  if (res.ok && res.data?.data?.id) setVal("admin-team-dept", res.data.data.id);
}

async function createTeam() {
  await Api.post("/api/v1/organizations/teams", {
    body: {
      name: val("admin-team-name"),
      description: val("admin-team-desc") || undefined,
      departmentId: val("admin-team-dept"),
    },
  });
}

async function addEmployee() {
  await Api.post("/api/v1/organizations/employees", {
    body: pick(
      {
        userId: val("admin-emp-user"),
        organizationId: val("admin-emp-org") || val("ctx-org-id"),
        departmentId: val("admin-emp-dept") || undefined,
        teamId: val("admin-emp-team") || undefined,
        employeeCode: val("admin-emp-code") || undefined,
        jobTitle: val("admin-emp-title") || undefined,
      },
      ["userId", "organizationId", "departmentId", "teamId", "employeeCode", "jobTitle"]
    ),
  });
}

async function loadAdminDashboard() {
  const res = await Api.get("/api/v1/dashboard/admin");
  const d = res.data?.data || {};
  $("#kpi-admin").innerHTML = Object.entries(d)
    .map(
      ([k, v]) =>
        `<div class="kpi"><div class="label">${escapeHtml(k)}</div><div class="value">${escapeHtml(
          typeof v === "object" ? JSON.stringify(v) : v
        )}</div></div>`
    )
    .join("") || `<div class="empty">No admin dashboard fields</div>`;
}

async function loadAnalytics() {
  const orgId = val("analytics-org") || val("ctx-org-id");
  const res = await Api.get("/api/v1/analytics/dashboard", {
    query: { organizationId: orgId },
  });
  $("#analytics-out").textContent = JSON.stringify(res.data?.data, null, 2);
}

async function loadPopularCourses() {
  const res = await Api.get("/api/v1/analytics/popular-courses", {
    query: { limit: 10 },
  });
  $("#analytics-out").textContent = JSON.stringify(res.data?.data, null, 2);
}

/* ---------- Wiring ---------- */
window.onApiResult = showResponse;

window.onEnter_home = () => {
  loadPublicDashboard();
  loadEmployeeDashboard();
  loadMyEnrollments();
};
window.onEnter_catalog = loadCatalog;
window.onEnter_certs = loadCertificates;
window.onEnter_notifs = loadNotifications;
window.onEnter_profile = loadProfile;
window.onEnter_admin_monitor = loadAdminDashboard;

function bindClicks() {
  document.body.addEventListener("click", async (e) => {
    const navBtn = e.target.closest(".nav button[data-view]");
    if (navBtn) {
      navigate(navBtn.dataset.view);
      return;
    }

    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;

    const map = {
      register: doRegister,
      login: doLogin,
      refresh: doRefresh,
      logout: doLogout,
      forgot: doForgot,
      "load-catalog": loadCatalog,
      "search-catalog": searchCourses,
      "global-search": globalSearch,
      "open-course": () => openCourse(id),
      "enroll-course": async () => {
        setVal("course-id", id);
        setVal("ctx-course-id", id);
        await enrollSelf();
      },
      enroll: enrollSelf,
      "load-enrollments": loadMyEnrollments,
      "open-lesson": () => openLesson(id),
      "load-progress": loadProgress,
      "update-progress": updateProgress,
      "load-resume": loadResume,
      "load-assessments": () => loadCourseAssessments(),
      "load-assessment": () => loadAssessment(id),
      "submit-assessment": submitAssessment,
      "load-certs": loadCertificates,
      "verify-cert": verifyCertificate,
      "download-cert": () => downloadCertificate(id),
      "load-notifs": loadNotifications,
      "read-notif": () => Api.put(`/api/v1/notifications/${id}/read`),
      "del-notif": () => Api.del(`/api/v1/notifications/${id}`),
      "read-all-notifs": () => Api.put("/api/v1/notifications/read-all"),
      "load-profile": loadProfile,
      "save-profile": saveProfile,
      "create-course": createCourse,
      "create-module": createModule,
      "create-lesson": createLesson,
      "publish-course": publishCourse,
      "archive-course": archiveCourse,
      "create-category": createCategory,
      "create-assessment": createAssessment,
      "create-question": createQuestion,
      "assign-course": assignCourse,
      "create-path": createLearningPath,
      "create-org": createOrg,
      "list-orgs": listOrgs,
      "create-dept": createDepartment,
      "create-team": createTeam,
      "add-employee": addEmployee,
      "load-admin-dash": loadAdminDashboard,
      "load-analytics": loadAnalytics,
      "load-popular": loadPopularCourses,
      "hydrate-user": hydrateUserId,
    };

    if (map[action]) await map[action]();
  });
}

function init() {
  setVal("base-url", Api.getBaseUrl());
  const s = Api.getSession();
  if (s.userId) setVal("ctx-user-id", s.userId);
  renderSession();
  bindClicks();

  $("#btn-save-base").addEventListener("click", () => {
    Api.setBaseUrl(val("base-url") || "http://localhost:8081");
    setVal("base-url", Api.getBaseUrl());
  });

  $("#btn-logout").addEventListener("click", doLogout);

  const initial = (location.hash || "#auth").replace("#", "") || "auth";
  navigate(initial);
}

document.addEventListener("DOMContentLoaded", init);
