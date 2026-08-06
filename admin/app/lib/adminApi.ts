import { backendFetchBlob, backendRequest, LessonResponse, PageResponse } from "./backendApi";

export const ADMIN_ROLES = ["HR_ADMIN", "ORGANIZATION_ADMIN", "SUPER_ADMIN"] as const;
export const SUPER_ADMIN_ROLE = "SUPER_ADMIN";

// ---------------------------------------------------------------------------
// Certificate template editor - backed by /api/v1/admin/certificate-templates
// ---------------------------------------------------------------------------

export type CertificateElementType = "TEXT" | "QR";
export type CertificateTextAlign = "LEFT" | "CENTER" | "RIGHT";

export const CERTIFICATE_VARIABLES = [
  { key: "recipient_name", label: "Recipient name" },
  { key: "course_name", label: "Course name" },
  { key: "certificate_number", label: "Certificate number" },
  { key: "issued_date", label: "Issued date" },
  { key: "issuer_name", label: "Issuer name" },
] as const;

export type CertificateTemplateElement = {
  id?: string;
  elementType: CertificateElementType;
  content?: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  fontFamily?: string | null;
  fontSize?: number | null;
  fontColor?: string | null;
  bold?: boolean | null;
  textAlign?: CertificateTextAlign | null;
  orderIndex?: number | null;
};

export type CertificateTemplateResponse = {
  id: string;
  courseId: string;
  originalPdfUrl: string;
  originalFilename?: string | null;
  pageWidth: number;
  pageHeight: number;
  elements: CertificateTemplateElement[];
};

export async function getCertificateTemplate(courseId: string): Promise<CertificateTemplateResponse | null> {
  try {
    const response = await backendRequest<CertificateTemplateResponse>(
      `/api/v1/admin/certificate-templates/course/${courseId}`,
      { headers: { Accept: "application/json" } },
    );
    return response.data || null;
  } catch {
    return null;
  }
}

export async function uploadCertificateTemplate(courseId: string, file: File): Promise<CertificateTemplateResponse | null> {
  const formData = new FormData();
  formData.set("file", file);
  const response = await backendRequest<CertificateTemplateResponse>(
    `/api/v1/admin/certificate-templates/course/${courseId}`,
    { method: "POST", body: formData },
  );
  return response.data || null;
}

export async function saveCertificateTemplateLayout(
  templateId: string,
  elements: CertificateTemplateElement[],
): Promise<CertificateTemplateResponse | null> {
  const response = await backendRequest<CertificateTemplateResponse>(
    `/api/v1/admin/certificate-templates/${templateId}/layout`,
    { method: "PUT", body: JSON.stringify({ elements }) },
  );
  return response.data || null;
}

export async function previewCertificateTemplate(templateId: string): Promise<Blob> {
  return backendFetchBlob(`/api/v1/admin/certificate-templates/${templateId}/preview`);
}

export async function deleteCertificateTemplate(templateId: string): Promise<void> {
  await backendRequest<void>(`/api/v1/admin/certificate-templates/${templateId}`, { method: "DELETE" });
}

export type CategoryResponse = {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  subcategories?: CategoryResponse[] | null;
};

// ---------------------------------------------------------------------------
// Admin course catalog - backed by /api/v1/admin/courses (AdminCourseListResponse)
// ---------------------------------------------------------------------------

export type AdminCourseResponse = {
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
  rating?: number | null;
  totalEnrollments?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CreateCourseRequest = {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  categoryId: string;
  organizationId?: string;
  visibility: "PUBLIC" | "ORGANIZATION";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  durationHours?: number;
  price?: number;
};

export type UpdateCourseRequest = {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  categoryId?: string;
  organizationId?: string;
  visibility?: "PUBLIC" | "ORGANIZATION";
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  durationHours?: number;
  price?: number;
};

// ---------------------------------------------------------------------------
// Curriculum builder - modules/lessons - backed by /api/v1/admin/modules and
// /api/v1/admin/lessons (AdminModuleResponse / AdminLessonResponse)
// ---------------------------------------------------------------------------

export type ModuleResponse = {
  id: string;
  title: string;
  description?: string | null;
  orderIndex?: number | null;
  courseId?: string | null;
  lessons?: LessonResponse[] | null;
};

export type CreateModuleRequest = {
  title: string;
  description?: string;
  orderIndex: number;
  courseId: string;
};

export type CreateLessonRequest = {
  title: string;
  description?: string;
  contentUrl?: string;
  contentType?: "VIDEO" | "DOCUMENT" | "QUIZ" | "ASSIGNMENT" | "ARTICLE" | "INTERACTIVE";
  durationMinutes?: number;
  orderIndex: number;
  moduleId: string;
};

// ---------------------------------------------------------------------------
// Quiz builder - backed by /api/v1/admin/assessments (AdminQuizBuilderResponse)
// ---------------------------------------------------------------------------

export type AdminOptionInput = {
  optionText: string;
  correct: boolean;
};

export type AdminQuestionInput = {
  questionText: string;
  questionType?: string;
  points?: number;
  orderIndex?: number;
  options: AdminOptionInput[];
};

export type CreateAssessmentRequest = {
  title: string;
  description?: string;
  courseId: string;
  assessmentType: "QUIZ" | "MCQ" | "ASSIGNMENT" | "CODING";
  passingScore?: number;
  timeLimitMinutes?: number;
  maxAttempts?: number;
};

export type UpdateAssessmentRequest = {
  title?: string;
  description?: string;
  assessmentType?: "QUIZ" | "MCQ" | "ASSIGNMENT" | "CODING";
  passingScore?: number;
  timeLimitMinutes?: number;
  maxAttempts?: number;
  questions?: AdminQuestionBuilderInput[];
};

export type AdminQuestionBuilderInput = {
  questionText: string;
  questionType: string;
  points?: number;
  orderIndex: number;
  options?: Array<{ optionText: string; correct: boolean; orderIndex?: number }>;
};

export type QuestionResponse = {
  id: string;
  questionText: string;
  questionType?: string | null;
  points?: number | null;
  orderIndex?: number | null;
  assessmentId?: string | null;
  options?: Array<{ id: string; optionText: string; correct?: boolean | null }> | null;
};

export type AdminAssessmentResponse = {
  id: string;
  title: string;
  description?: string | null;
  courseId?: string | null;
  assessmentType?: string | null;
  passingScore?: number | null;
  timeLimitMinutes?: number | null;
  maxAttempts?: number | null;
  questions?: QuestionResponse[] | null;
};

export type DailyActiveUsersResponse = {
  date: string;
  activeUsers: number;
};

export type PopularCourseReport = {
  courseId: string;
  courseTitle: string;
  totalEnrollments?: number | null;
  averageRating?: number | string | null;
  completionCount?: number | null;
};

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

export type AssignCourseRequest = {
  userId: string;
  courseId: string;
  assignedById: string;
  dueDate?: string;
};

// ---------------------------------------------------------------------------
// Admin dashboard stats - backed by /api/v1/admin/dashboard (AdminDashboardStatsResponse)
// ---------------------------------------------------------------------------

export type AdminDashboardStatsResponse = {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  totalRevenue: number;
  totalAssessments: number;
  totalCertificatesIssued: number;
  pendingReviews: number;
};

// ---------------------------------------------------------------------------
// Admin account management - backed by /api/v1/admin/admins (AdminAccountResponse)
// ---------------------------------------------------------------------------

export const ADMIN_TIER_ROLES = ["TRAINER", "HR_ADMIN", "ORGANIZATION_ADMIN", "SUPER_ADMIN"] as const;
export type AdminTierRole = (typeof ADMIN_TIER_ROLES)[number];

export type AdminAccountResponse = {
  id: string;
  userId?: string | null;
  fullName?: string | null;
  email: string;
  role: AdminTierRole;
  active: boolean;
  createdAt?: string | null;
};

export type CreateAdminAccountRequest = {
  fullName: string;
  email: string;
  password: string;
  role: AdminTierRole;
};

// ---------------------------------------------------------------------------
// Audit log - backed by /api/v1/admin/audit-logs (AuditLogResponse)
// ---------------------------------------------------------------------------

export type AuditLogResponse = {
  id: string;
  userId?: string | null;
  actorName?: string | null;
  action?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  createdAt?: string | null;
};

// ---------------------------------------------------------------------------
// Reading content - backed by /api/v1/admin/reading-content (AdminReadingContentResponse)
// ---------------------------------------------------------------------------

export type AdminReadingContentResponse = {
  id: string;
  title: string;
  contentHtml?: string | null;
  contentMarkdown?: string | null;
  estimatedReadingMinutes?: number | null;
  lessonId?: string | null;
};

export type SaveReadingContentRequest = {
  title: string;
  contentHtml?: string;
  contentMarkdown?: string;
  estimatedReadingMinutes?: number;
  lessonId?: string;
};

// ---------------------------------------------------------------------------
// Video rules - backed by /api/v1/admin/video-rules (AdminVideoRulesResponse)
// ---------------------------------------------------------------------------

export type AdminVideoRulesResponse = {
  id: string;
  allowedFormats?: string[] | null;
  maxFileSizeBytes?: number | null;
  maxDurationMinutes?: number | null;
  allowedCodecs?: string[] | null;
  defaultEncodingProfile?: string | null;
  requireTranscoding?: boolean | null;
  autoGenerateThumbnails?: boolean | null;
};

export type UpdateVideoRulesRequest = {
  allowedFormats: string[];
  maxFileSizeBytes: number;
  maxDurationMinutes?: number;
  allowedCodecs: string[];
  defaultEncodingProfile?: string;
  requireTranscoding?: boolean;
  autoGenerateThumbnails?: boolean;
};

// ---------------------------------------------------------------------------
// Module/lesson partial update + reorder
// ---------------------------------------------------------------------------

export type UpdateModuleRequest = {
  title?: string;
  description?: string;
  orderIndex?: number;
};

export type UpdateLessonRequest = {
  title?: string;
  description?: string;
  contentUrl?: string;
  contentType?: "VIDEO" | "DOCUMENT" | "QUIZ" | "ASSIGNMENT" | "ARTICLE" | "INTERACTIVE";
  durationMinutes?: number;
  orderIndex?: number;
};

export type OrderItem = { id: string; orderIndex: number };

// ---------------------------------------------------------------------------
// Unchanged - these continue to hit the existing shared endpoints
// (enrollments, categories, analytics).
// ---------------------------------------------------------------------------

export async function getEnrollmentsForUser(userId: string): Promise<EnrollmentResponse[]> {
  const response = await backendRequest<EnrollmentResponse[]>(`/api/v1/enrollments/user/${userId}`, {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}

export async function getCategories(): Promise<CategoryResponse[]> {
  const response = await backendRequest<CategoryResponse[]>("/api/v1/courses/categories", {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}

export async function createCategory(payload: { name: string; description?: string; parentId?: string }): Promise<CategoryResponse | null> {
  const response = await backendRequest<CategoryResponse>("/api/v1/courses/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function getPopularCourses(limit = 5): Promise<PopularCourseReport[]> {
  const response = await backendRequest<PopularCourseReport[]>(`/api/v1/analytics/popular-courses?limit=${limit}`, {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}

// ---------------------------------------------------------------------------
// Changed - repointed to the new /api/v1/admin/** admin-only API surface.
// ---------------------------------------------------------------------------

export async function getAdminCourses(
  page = 0,
  size = 100,
  search = "",
  status?: string,
): Promise<PageResponse<AdminCourseResponse> | null> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (search.trim()) params.set("search", search.trim());
  if (status) params.set("status", status);
  const response = await backendRequest<PageResponse<AdminCourseResponse>>(`/api/v1/admin/courses?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });
  return response.data || null;
}

export async function createCourse(payload: CreateCourseRequest): Promise<AdminCourseResponse | null> {
  const response = await backendRequest<AdminCourseResponse>("/api/v1/admin/courses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function updateCourse(courseId: string, payload: UpdateCourseRequest): Promise<AdminCourseResponse | null> {
  const response = await backendRequest<AdminCourseResponse>(`/api/v1/admin/courses/${courseId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function deleteCourse(courseId: string): Promise<void> {
  await backendRequest<void>(`/api/v1/admin/courses/${courseId}`, { method: "DELETE" });
}

export async function publishCourse(courseId: string): Promise<AdminCourseResponse | null> {
  const response = await backendRequest<AdminCourseResponse>(`/api/v1/admin/courses/${courseId}/publish`, { method: "POST" });
  return response.data || null;
}

export async function archiveCourse(courseId: string): Promise<AdminCourseResponse | null> {
  const response = await backendRequest<AdminCourseResponse>(`/api/v1/admin/courses/${courseId}/archive`, { method: "POST" });
  return response.data || null;
}

export async function getCourseModules(courseId: string): Promise<ModuleResponse[]> {
  const response = await backendRequest<ModuleResponse[]>(`/api/v1/admin/courses/${courseId}/modules`, {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}

export async function createModule(payload: CreateModuleRequest): Promise<ModuleResponse | null> {
  const response = await backendRequest<ModuleResponse>("/api/v1/admin/modules", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function updateModule(moduleId: string, payload: UpdateModuleRequest): Promise<ModuleResponse | null> {
  const response = await backendRequest<ModuleResponse>(`/api/v1/admin/modules/${moduleId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function deleteModule(moduleId: string): Promise<void> {
  await backendRequest<void>(`/api/v1/admin/modules/${moduleId}`, { method: "DELETE" });
}

export async function createLesson(payload: CreateLessonRequest): Promise<LessonResponse | null> {
  const response = await backendRequest<LessonResponse>("/api/v1/admin/lessons", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function updateLesson(lessonId: string, payload: UpdateLessonRequest): Promise<LessonResponse | null> {
  const response = await backendRequest<LessonResponse>(`/api/v1/admin/lessons/${lessonId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function deleteLesson(lessonId: string): Promise<void> {
  await backendRequest<void>(`/api/v1/admin/lessons/${lessonId}`, { method: "DELETE" });
}

export async function uploadLessonVideo(lessonId: string, file: File): Promise<LessonResponse | null> {
  const formData = new FormData();
  formData.set("file", file);
  const response = await backendRequest<LessonResponse>(`/api/v1/admin/lessons/${lessonId}/video`, {
    method: "POST",
    body: formData,
  });
  return response.data || null;
}

export async function uploadLessonCaptions(lessonId: string, file: File): Promise<LessonResponse | null> {
  const formData = new FormData();
  formData.set("file", file);
  const response = await backendRequest<LessonResponse>(`/api/v1/admin/lessons/${lessonId}/captions`, {
    method: "POST",
    body: formData,
  });
  return response.data || null;
}

export async function uploadLessonDocument(lessonId: string, file: File): Promise<LessonResponse | null> {
  const formData = new FormData();
  formData.set("file", file);
  const response = await backendRequest<LessonResponse>(`/api/v1/admin/lessons/${lessonId}/document`, {
    method: "POST",
    body: formData,
  });
  return response.data || null;
}

export async function getAssessment(assessmentId: string): Promise<AdminAssessmentResponse | null> {
  const response = await backendRequest<AdminAssessmentResponse>(`/api/v1/admin/assessments/${assessmentId}`, {
    headers: { Accept: "application/json" },
  });
  return response.data || null;
}

export async function getAssessmentsByCourse(courseId: string): Promise<AdminAssessmentResponse[]> {
  const response = await backendRequest<AdminAssessmentResponse[]>(`/api/v1/admin/courses/${courseId}/assessments`, {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}

export async function createAssessment(
  payload: CreateAssessmentRequest,
): Promise<AdminAssessmentResponse | null> {
  const response = await backendRequest<AdminAssessmentResponse>("/api/v1/admin/assessments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function updateAssessment(
  assessmentId: string,
  payload: UpdateAssessmentRequest,
): Promise<AdminAssessmentResponse | null> {
  const response = await backendRequest<AdminAssessmentResponse>(`/api/v1/admin/assessments/${assessmentId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function deleteAssessment(assessmentId: string): Promise<void> {
  await backendRequest<void>(`/api/v1/admin/assessments/${assessmentId}`, { method: "DELETE" });
}

// The admin quiz builder API (AdminService) only exposes whole-assessment
// create/update, with the full question list nested inside the request -
// there is no standalone per-question endpoint. These wrappers preserve the
// old per-question call shape the quiz builder UI uses (add one question,
// delete one question) by round-tripping through updateAssessment with the
// full question list.

function toQuestionBuilderInput(question: QuestionResponse): AdminQuestionBuilderInput {
  return {
    questionText: question.questionText,
    questionType: question.questionType || "MULTIPLE_CHOICE",
    points: question.points ?? undefined,
    orderIndex: question.orderIndex ?? 0,
    options: (question.options || []).map((option) => ({
      optionText: option.optionText,
      correct: Boolean(option.correct),
    })),
  };
}

async function saveAssessmentQuestions(
  assessmentId: string,
  questions: AdminQuestionBuilderInput[],
): Promise<AdminAssessmentResponse | null> {
  const current = await getAssessment(assessmentId);
  if (!current) return null;
  return updateAssessment(assessmentId, {
    title: current.title,
    description: current.description ?? undefined,
    assessmentType: (current.assessmentType as UpdateAssessmentRequest["assessmentType"]) ?? undefined,
    passingScore: current.passingScore ?? undefined,
    timeLimitMinutes: current.timeLimitMinutes ?? undefined,
    maxAttempts: current.maxAttempts ?? undefined,
    questions,
  });
}

export async function createQuestion(assessmentId: string, payload: AdminQuestionInput): Promise<QuestionResponse | null> {
  const current = await getAssessment(assessmentId);
  if (!current) return null;
  const existing = (current.questions || []).map(toQuestionBuilderInput);
  const newQuestion: AdminQuestionBuilderInput = {
    questionText: payload.questionText,
    questionType: payload.questionType || "MULTIPLE_CHOICE",
    points: payload.points,
    orderIndex: payload.orderIndex ?? existing.length,
    options: payload.options.map((option) => ({ optionText: option.optionText, correct: option.correct })),
  };
  const updated = await saveAssessmentQuestions(assessmentId, [...existing, newQuestion]);
  const questions = updated?.questions || [];
  return questions.length ? questions[questions.length - 1] : null;
}

export async function updateQuestion(
  assessmentId: string,
  questionId: string,
  payload: AdminQuestionInput,
): Promise<QuestionResponse | null> {
  const current = await getAssessment(assessmentId);
  if (!current) return null;
  const merged = (current.questions || []).map((question) =>
    question.id === questionId
      ? {
          questionText: payload.questionText,
          questionType: payload.questionType || question.questionType || "MULTIPLE_CHOICE",
          points: payload.points ?? question.points ?? undefined,
          orderIndex: payload.orderIndex ?? question.orderIndex ?? 0,
          options: payload.options.map((option) => ({ optionText: option.optionText, correct: option.correct })),
        }
      : toQuestionBuilderInput(question),
  );
  const updated = await saveAssessmentQuestions(assessmentId, merged);
  return (updated?.questions || []).find((question) => question.questionText === payload.questionText) || null;
}

export async function deleteQuestion(assessmentId: string, questionId: string): Promise<void> {
  const current = await getAssessment(assessmentId);
  if (!current) return;
  const remaining = (current.questions || [])
    .filter((question) => question.id !== questionId)
    .map(toQuestionBuilderInput);
  await saveAssessmentQuestions(assessmentId, remaining);
}

// ---------------------------------------------------------------------------
// Admin dashboard stats (new /api/v1/admin/dashboard surface)
// ---------------------------------------------------------------------------

export async function getAdminDashboardStats(): Promise<AdminDashboardStatsResponse | null> {
  const response = await backendRequest<AdminDashboardStatsResponse>("/api/v1/admin/dashboard", {
    headers: { Accept: "application/json" },
  });
  return response.data || null;
}

// ---------------------------------------------------------------------------
// Course access - reuses the existing /api/v1/enrollments/** surface
// ---------------------------------------------------------------------------

export async function assignCourseToUser(payload: AssignCourseRequest): Promise<EnrollmentResponse | null> {
  const response = await backendRequest<EnrollmentResponse>("/api/v1/enrollments/assign", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function getEnrollmentsForCourse(courseId: string): Promise<EnrollmentResponse[]> {
  const response = await backendRequest<EnrollmentResponse[]>(`/api/v1/enrollments/course/${courseId}`, {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}

export async function updateEnrollmentStatus(
  enrollmentId: string,
  status: "ACTIVE" | "COMPLETED" | "DROPPED" | "EXPIRED",
): Promise<EnrollmentResponse | null> {
  const response = await backendRequest<EnrollmentResponse>(
    `/api/v1/enrollments/${enrollmentId}/status?status=${status}`,
    { method: "PUT" },
  );
  return response.data || null;
}

// ---------------------------------------------------------------------------
// Admin account management
// ---------------------------------------------------------------------------

export async function getAdmins(page = 0, size = 50): Promise<PageResponse<AdminAccountResponse> | null> {
  const response = await backendRequest<PageResponse<AdminAccountResponse>>(
    `/api/v1/admin/admins?page=${page}&size=${size}`,
    { headers: { Accept: "application/json" } },
  );
  return response.data || null;
}

export async function createAdmin(payload: CreateAdminAccountRequest): Promise<AdminAccountResponse | null> {
  const response = await backendRequest<AdminAccountResponse>("/api/v1/admin/admins", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function updateAdminRole(adminId: string, role: AdminTierRole): Promise<AdminAccountResponse | null> {
  const response = await backendRequest<AdminAccountResponse>(`/api/v1/admin/admins/${adminId}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
  return response.data || null;
}

export async function deactivateAdmin(adminId: string): Promise<void> {
  await backendRequest<void>(`/api/v1/admin/admins/${adminId}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------

export async function getAuditLogs(
  page = 0,
  size = 50,
  entityType?: string,
  userId?: string,
): Promise<PageResponse<AuditLogResponse> | null> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (entityType) params.set("entityType", entityType);
  if (userId) params.set("userId", userId);
  const response = await backendRequest<PageResponse<AuditLogResponse>>(`/api/v1/admin/audit-logs?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });
  return response.data || null;
}

// ---------------------------------------------------------------------------
// Reading content
// ---------------------------------------------------------------------------

export async function getReadingContent(lessonId: string): Promise<AdminReadingContentResponse | null> {
  try {
    const response = await backendRequest<AdminReadingContentResponse>(`/api/v1/admin/reading-content/${lessonId}`, {
      headers: { Accept: "application/json" },
    });
    return response.data || null;
  } catch {
    return null;
  }
}

export async function createReadingContent(payload: SaveReadingContentRequest): Promise<AdminReadingContentResponse | null> {
  const response = await backendRequest<AdminReadingContentResponse>("/api/v1/admin/reading-content", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function updateReadingContent(
  id: string,
  payload: SaveReadingContentRequest,
): Promise<AdminReadingContentResponse | null> {
  const response = await backendRequest<AdminReadingContentResponse>(`/api/v1/admin/reading-content/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function deleteReadingContent(id: string): Promise<void> {
  await backendRequest<void>(`/api/v1/admin/reading-content/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Video rules
// ---------------------------------------------------------------------------

export async function getVideoRules(): Promise<AdminVideoRulesResponse | null> {
  const response = await backendRequest<AdminVideoRulesResponse>("/api/v1/admin/video-rules", {
    headers: { Accept: "application/json" },
  });
  return response.data || null;
}

export async function updateVideoRules(payload: UpdateVideoRulesRequest): Promise<AdminVideoRulesResponse | null> {
  const response = await backendRequest<AdminVideoRulesResponse>("/api/v1/admin/video-rules", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

// ---------------------------------------------------------------------------
// Reorder
// ---------------------------------------------------------------------------

export async function reorderModules(courseId: string, modules: OrderItem[]): Promise<void> {
  await backendRequest<void>(`/api/v1/admin/courses/${courseId}/modules/reorder`, {
    method: "PUT",
    body: JSON.stringify({ modules }),
  });
}

export async function reorderLessons(moduleId: string, lessons: OrderItem[]): Promise<void> {
  await backendRequest<void>(`/api/v1/admin/modules/${moduleId}/lessons/reorder`, {
    method: "PUT",
    body: JSON.stringify({ lessons }),
  });
}

// ---------------------------------------------------------------------------
// Assignment grading
// ---------------------------------------------------------------------------

export type AssignmentSubmissionResponse = {
  id: string;
  lessonId: string;
  lessonTitle?: string | null;
  userId: string;
  userName?: string | null;
  submissionText?: string | null;
  fileUrl?: string | null;
  status: "SUBMITTED" | "GRADED";
  score?: number | null;
  feedback?: string | null;
  gradedByName?: string | null;
  gradedAt?: string | null;
  createdAt?: string | null;
};

export async function getLessonSubmissions(lessonId: string): Promise<AssignmentSubmissionResponse[]> {
  const response = await backendRequest<AssignmentSubmissionResponse[]>(`/api/v1/admin/lessons/${lessonId}/submissions`, {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}

export async function gradeSubmission(submissionId: string, score: number, feedback?: string): Promise<AssignmentSubmissionResponse | null> {
  const response = await backendRequest<AssignmentSubmissionResponse>(`/api/v1/admin/submissions/${submissionId}/grade`, {
    method: "PUT",
    body: JSON.stringify({ score, feedback }),
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

export type CreateContestRequest = {
  title: string;
  description?: string;
  assessmentId: string;
  courseId: string;
  startAt: string;
  endAt: string;
};

export async function getContests(courseId?: string): Promise<ContestResponse[]> {
  const query = courseId ? `?courseId=${courseId}` : "";
  const response = await backendRequest<ContestResponse[]>(`/api/v1/admin/contests${query}`, {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}

export async function createContest(payload: CreateContestRequest): Promise<ContestResponse | null> {
  const response = await backendRequest<ContestResponse>("/api/v1/admin/contests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function deleteContest(id: string): Promise<void> {
  await backendRequest<void>(`/api/v1/admin/contests/${id}`, { method: "DELETE" });
}

export async function getContestLeaderboard(id: string): Promise<LeaderboardEntryResponse[]> {
  const response = await backendRequest<LeaderboardEntryResponse[]>(`/api/v1/admin/contests/${id}/leaderboard`, {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}

// ---------------------------------------------------------------------------
// Learners directory (organization-independent)
// ---------------------------------------------------------------------------

export type AdminLearnerResponse = {
  userId: string;
  fullName?: string | null;
  email?: string | null;
  learnerCode?: string | null;
  role?: string | null;
  active: boolean;
  createdAt?: string | null;
};

export async function getLearners(page = 0, size = 50, search = ""): Promise<PageResponse<AdminLearnerResponse> | null> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (search.trim()) params.set("search", search.trim());
  const response = await backendRequest<PageResponse<AdminLearnerResponse>>(`/api/v1/admin/learners?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });
  return response.data || null;
}

// ---------------------------------------------------------------------------
// Platform-wide analytics (organization-independent)
// ---------------------------------------------------------------------------

export async function getDailyActiveUsers(from: string, to: string): Promise<DailyActiveUsersResponse[]> {
  const response = await backendRequest<DailyActiveUsersResponse[]>(`/api/v1/analytics/daily-active-users?from=${from}&to=${to}`, {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}
