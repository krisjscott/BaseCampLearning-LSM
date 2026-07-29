package com.tiesverse.backend.course.service;

import com.tiesverse.backend.course.dto.request.CreateCategoryRequest;
import com.tiesverse.backend.course.dto.request.CreateCourseRequest;
import com.tiesverse.backend.course.dto.request.CreateLessonRequest;
import com.tiesverse.backend.course.dto.request.CreateModuleRequest;
import com.tiesverse.backend.course.dto.request.UpdateCourseRequest;
import com.tiesverse.backend.course.dto.response.CategoryResponse;
import com.tiesverse.backend.course.dto.response.CourseResponse;
import com.tiesverse.backend.course.dto.response.LessonResponse;
import com.tiesverse.backend.course.dto.response.ModuleResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface CourseService {

    CourseResponse createCourse(CreateCourseRequest request, UUID instructorId);

    CourseResponse getCourse(UUID id);

    Page<CourseResponse> getAllCourses(Pageable pageable);

    Page<CourseResponse> searchCourses(String title, Pageable pageable);

    List<CourseResponse> getCoursesByInstructor(UUID instructorId);

    List<CourseResponse> getCoursesByOrganization(UUID organizationId);

    CourseResponse updateCourse(UUID id, UpdateCourseRequest request);

    void deleteCourse(UUID id);

    CourseResponse publishCourse(UUID id);

    CourseResponse archiveCourse(UUID id);

    ModuleResponse createModule(CreateModuleRequest request);

    List<ModuleResponse> getModules(UUID courseId);

    ModuleResponse getModule(UUID id);

    ModuleResponse updateModule(UUID id, CreateModuleRequest request);

    void deleteModule(UUID id);

    LessonResponse createLesson(CreateLessonRequest request);

    List<LessonResponse> getLessons(UUID moduleId);

    LessonResponse getLesson(UUID id);

    LessonResponse updateLesson(UUID id, CreateLessonRequest request);

    void deleteLesson(UUID id);

    CategoryResponse createCategory(CreateCategoryRequest request);

    List<CategoryResponse> getRootCategories();

    List<CategoryResponse> getSubcategories(UUID parentId);

    CategoryResponse getCategory(UUID id);

    CategoryResponse updateCategory(UUID id, CreateCategoryRequest request);

    void deleteCategory(UUID id);
}
