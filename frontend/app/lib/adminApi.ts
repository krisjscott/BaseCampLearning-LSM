import { backendRequest, CourseResponse, LessonResponse, PageResponse } from "./backendApi";

export const ADMIN_ROLES = ["HR_ADMIN", "ORGANIZATION_ADMIN", "SUPER_ADMIN"] as const;
export const SUPER_ADMIN_ROLE = "SUPER_ADMIN";

export type OrganizationResponse = {
  id: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  active: boolean;
  createdAt?: string | null;
};

export type EmployeeResponse = {
  id: string;
  userId: string;
  fullName?: string | null;
  employeeCode?: string | null;
  jobTitle?: string | null;
  departmentName?: string | null;
  teamName?: string | null;
  active: boolean;
};

export type CategoryResponse = {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  subcategories?: CategoryResponse[] | null;
};

export type ModuleResponse = {
  id: string;
  title: string;
  description?: string | null;
  orderIndex?: number | null;
  lessons?: LessonResponse[] | null;
};

export type CreateCourseRequest = {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  categoryId?: string;
  organizationId?: string;
  visibility?: "PUBLIC" | "ORGANIZATION";
  durationHours?: number;
  price?: number;
};

export type UpdateCourseRequest = {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  visibility?: "PUBLIC" | "ORGANIZATION";
  durationHours?: number;
  price?: number;
};

export type CreateModuleRequest = {
  title: string;
  description?: string;
  orderIndex?: number;
  courseId: string;
};

export type CreateLessonRequest = {
  title: string;
  description?: string;
  contentUrl?: string;
  contentType?: "VIDEO" | "DOCUMENT" | "QUIZ" | "ASSIGNMENT" | "ARTICLE" | "INTERACTIVE";
  durationMinutes?: number;
  orderIndex?: number;
  moduleId: string;
};

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
  type?: "QUIZ" | "MCQ" | "ASSIGNMENT" | "CODING";
  passingScore?: number;
  timeLimitMinutes?: number;
  maxAttempts?: number;
};

export type QuestionResponse = {
  id: string;
  questionText: string;
  questionType?: string | null;
  points?: number | null;
  orderIndex?: number | null;
  options?: Array<{ id: string; optionText: string }> | null;
};

export type AdminAssessmentResponse = {
  id: string;
  title: string;
  description?: string | null;
  courseId?: string | null;
  type?: string | null;
  passingScore?: number | null;
  timeLimitMinutes?: number | null;
  maxAttempts?: number | null;
  questions?: QuestionResponse[] | null;
};

export type AdminDashboardResponse = {
  activeEmployees?: number | null;
  totalCourses?: number | null;
  averageCompletionRate?: number | null;
  analytics?: Array<{ metric: string; value: unknown }> | null;
  pendingAssignments?: Array<{ courseId: string; courseTitle: string; pendingCount: number }> | null;
};

export type DailyActiveUsersResponse = {
  date: string;
  activeUsers: number;
};

export type CourseCompletionReport = {
  courseId: string;
  courseTitle: string;
  totalEnrolled: number;
  completed: number;
  completionRate?: number | null;
};

export type OrganizationProgressReport = {
  organizationId: string;
  organizationName: string;
  totalEmployees?: number | null;
  activeEmployees?: number | null;
  averageCompletion?: number | null;
};

export type PopularCourseReport = {
  courseId: string;
  courseTitle: string;
  totalEnrollments?: number | null;
  averageRating?: number | string | null;
  completionCount?: number | null;
};

export type QuizScoreReport = {
  assessmentId: string;
  assessmentTitle: string;
  averageScore?: number | null;
  totalAttempts?: number | null;
  passCount?: number | null;
  failCount?: number | null;
};

export type AnalyticsDashboardResponse = {
  dailyActiveUsers?: DailyActiveUsersResponse[] | null;
  courseCompletions?: CourseCompletionReport[] | null;
  quizScores?: QuizScoreReport[] | null;
  organizationProgress?: OrganizationProgressReport[] | null;
  popularCourses?: PopularCourseReport[] | null;
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

export async function getOrganizations(): Promise<OrganizationResponse[]> {
  const response = await backendRequest<OrganizationResponse[]>("/api/v1/organizations", {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}

export async function getEmployees(organizationId: string): Promise<EmployeeResponse[]> {
  const response = await backendRequest<EmployeeResponse[]>(
    `/api/v1/organizations/${organizationId}/employees`,
    { headers: { Accept: "application/json" } },
  );
  return response.data || [];
}

export async function getEnrollmentsForUser(userId: string): Promise<EnrollmentResponse[]> {
  const response = await backendRequest<EnrollmentResponse[]>(`/api/v1/enrollments/user/${userId}`, {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}

export async function getAdminCourses(page = 0, size = 100, search = ""): Promise<PageResponse<CourseResponse> | null> {
  const path = search.trim()
    ? `/api/v1/courses/search?title=${encodeURIComponent(search.trim())}&page=${page}&size=${size}`
    : `/api/v1/courses?page=${page}&size=${size}`;
  const response = await backendRequest<PageResponse<CourseResponse>>(path, {
    headers: { Accept: "application/json" },
  });
  return response.data || null;
}

export async function createCourse(instructorId: string, payload: CreateCourseRequest): Promise<CourseResponse | null> {
  const response = await backendRequest<CourseResponse>(`/api/v1/courses?instructorId=${instructorId}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function updateCourse(courseId: string, payload: UpdateCourseRequest): Promise<CourseResponse | null> {
  const response = await backendRequest<CourseResponse>(`/api/v1/courses/${courseId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function deleteCourse(courseId: string): Promise<void> {
  await backendRequest<void>(`/api/v1/courses/${courseId}`, { method: "DELETE" });
}

export async function publishCourse(courseId: string): Promise<CourseResponse | null> {
  const response = await backendRequest<CourseResponse>(`/api/v1/courses/${courseId}/publish`, { method: "POST" });
  return response.data || null;
}

export async function archiveCourse(courseId: string): Promise<CourseResponse | null> {
  const response = await backendRequest<CourseResponse>(`/api/v1/courses/${courseId}/archive`, { method: "POST" });
  return response.data || null;
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

export async function getCourseModules(courseId: string): Promise<ModuleResponse[]> {
  const response = await backendRequest<ModuleResponse[]>(`/api/v1/courses/${courseId}/modules`, {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}

export async function createModule(payload: CreateModuleRequest): Promise<ModuleResponse | null> {
  const response = await backendRequest<ModuleResponse>("/api/v1/courses/modules", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function updateModule(moduleId: string, payload: CreateModuleRequest): Promise<ModuleResponse | null> {
  const response = await backendRequest<ModuleResponse>(`/api/v1/courses/modules/${moduleId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function deleteModule(moduleId: string): Promise<void> {
  await backendRequest<void>(`/api/v1/courses/modules/${moduleId}`, { method: "DELETE" });
}

export async function createLesson(payload: CreateLessonRequest): Promise<LessonResponse | null> {
  const response = await backendRequest<LessonResponse>("/api/v1/courses/lessons", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function updateLesson(lessonId: string, payload: CreateLessonRequest): Promise<LessonResponse | null> {
  const response = await backendRequest<LessonResponse>(`/api/v1/courses/lessons/${lessonId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function deleteLesson(lessonId: string): Promise<void> {
  await backendRequest<void>(`/api/v1/courses/lessons/${lessonId}`, { method: "DELETE" });
}

export async function getAssessmentsByCourse(courseId: string): Promise<AdminAssessmentResponse[]> {
  const response = await backendRequest<AdminAssessmentResponse[]>(`/api/v1/assessments/course/${courseId}`, {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}

export async function createAssessment(
  payload: CreateAssessmentRequest,
): Promise<AdminAssessmentResponse | null> {
  const response = await backendRequest<AdminAssessmentResponse>("/api/v1/assessments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function updateAssessment(
  assessmentId: string,
  payload: CreateAssessmentRequest,
): Promise<AdminAssessmentResponse | null> {
  const response = await backendRequest<AdminAssessmentResponse>(`/api/v1/assessments/${assessmentId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function deleteAssessment(assessmentId: string): Promise<void> {
  await backendRequest<void>(`/api/v1/assessments/${assessmentId}`, { method: "DELETE" });
}

export async function createQuestion(assessmentId: string, payload: AdminQuestionInput): Promise<QuestionResponse | null> {
  const response = await backendRequest<QuestionResponse>(`/api/v1/assessments/${assessmentId}/questions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function updateQuestion(questionId: string, payload: AdminQuestionInput): Promise<QuestionResponse | null> {
  const response = await backendRequest<QuestionResponse>(`/api/v1/assessments/questions/${questionId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await backendRequest<void>(`/api/v1/assessments/questions/${questionId}`, { method: "DELETE" });
}

export async function getAdminDashboard(organizationId: string): Promise<AdminDashboardResponse | null> {
  const response = await backendRequest<AdminDashboardResponse>(
    `/api/v1/dashboard/admin?organizationId=${organizationId}`,
    { headers: { Accept: "application/json" } },
  );
  return response.data || null;
}

export async function getAnalyticsDashboard(organizationId: string): Promise<AnalyticsDashboardResponse | null> {
  const response = await backendRequest<AnalyticsDashboardResponse>(
    `/api/v1/analytics/dashboard?organizationId=${organizationId}`,
    { headers: { Accept: "application/json" } },
  );
  return response.data || null;
}

export async function getPopularCourses(limit = 5): Promise<PopularCourseReport[]> {
  const response = await backendRequest<PopularCourseReport[]>(`/api/v1/analytics/popular-courses?limit=${limit}`, {
    headers: { Accept: "application/json" },
  });
  return response.data || [];
}
