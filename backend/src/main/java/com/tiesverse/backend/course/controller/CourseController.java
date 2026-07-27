package com.tiesverse.backend.course.controller;

import com.tiesverse.backend.common.response.ApiResponse;
import com.tiesverse.backend.common.response.PageResponse;
import com.tiesverse.backend.course.dto.request.CreateCategoryRequest;
import com.tiesverse.backend.course.dto.request.CreateCourseRequest;
import com.tiesverse.backend.course.dto.request.CreateLessonRequest;
import com.tiesverse.backend.course.dto.request.CreateModuleRequest;
import com.tiesverse.backend.course.dto.request.UpdateCourseRequest;
import com.tiesverse.backend.course.dto.response.CategoryResponse;
import com.tiesverse.backend.course.dto.response.CourseResponse;
import com.tiesverse.backend.course.dto.response.LessonResponse;
import com.tiesverse.backend.course.dto.response.ModuleResponse;
import com.tiesverse.backend.course.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CourseResponse> createCourse(@Valid @RequestBody CreateCourseRequest request,
                                                    @RequestParam UUID instructorId) {
        return ApiResponse.success("Course created", courseService.createCourse(request, instructorId));
    }

    @GetMapping("/{id}")
    public ApiResponse<CourseResponse> getCourse(@PathVariable UUID id) {
        return ApiResponse.success(courseService.getCourse(id));
    }

    @GetMapping
    public ApiResponse<PageResponse<CourseResponse>> getAllCourses(Pageable pageable) {
        Page<CourseResponse> page = courseService.getAllCourses(pageable);
        PageResponse<CourseResponse> pageResponse = PageResponse.<CourseResponse>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
        return ApiResponse.success(pageResponse);
    }

    @GetMapping("/search")
    public ApiResponse<PageResponse<CourseResponse>> searchCourses(@RequestParam String title, Pageable pageable) {
        Page<CourseResponse> page = courseService.searchCourses(title, pageable);
        PageResponse<CourseResponse> pageResponse = PageResponse.<CourseResponse>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
        return ApiResponse.success(pageResponse);
    }

    @GetMapping("/instructor/{instructorId}")
    public ApiResponse<List<CourseResponse>> getCoursesByInstructor(@PathVariable UUID instructorId) {
        return ApiResponse.success(courseService.getCoursesByInstructor(instructorId));
    }

    @GetMapping("/organization/{organizationId}")
    public ApiResponse<List<CourseResponse>> getCoursesByOrganization(@PathVariable UUID organizationId) {
        return ApiResponse.success(courseService.getCoursesByOrganization(organizationId));
    }

    @PutMapping("/{id}")
    public ApiResponse<CourseResponse> updateCourse(@PathVariable UUID id,
                                                    @Valid @RequestBody UpdateCourseRequest request) {
        return ApiResponse.success("Course updated", courseService.updateCourse(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteCourse(@PathVariable UUID id) {
        courseService.deleteCourse(id);
        return ApiResponse.success("Course deleted", null);
    }

    @PostMapping("/{id}/publish")
    public ApiResponse<CourseResponse> publishCourse(@PathVariable UUID id) {
        return ApiResponse.success("Course published", courseService.publishCourse(id));
    }

    @PostMapping("/{id}/archive")
    public ApiResponse<CourseResponse> archiveCourse(@PathVariable UUID id) {
        return ApiResponse.success("Course archived", courseService.archiveCourse(id));
    }

    @PostMapping("/modules")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ModuleResponse> createModule(@Valid @RequestBody CreateModuleRequest request) {
        return ApiResponse.success("Module created", courseService.createModule(request));
    }

    @GetMapping("/{courseId}/modules")
    public ApiResponse<List<ModuleResponse>> getModules(@PathVariable UUID courseId) {
        return ApiResponse.success(courseService.getModules(courseId));
    }

    @GetMapping("/modules/{id}")
    public ApiResponse<ModuleResponse> getModule(@PathVariable UUID id) {
        return ApiResponse.success(courseService.getModule(id));
    }

    @PutMapping("/modules/{id}")
    public ApiResponse<ModuleResponse> updateModule(@PathVariable UUID id,
                                                    @Valid @RequestBody CreateModuleRequest request) {
        return ApiResponse.success("Module updated", courseService.updateModule(id, request));
    }

    @DeleteMapping("/modules/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteModule(@PathVariable UUID id) {
        courseService.deleteModule(id);
        return ApiResponse.success("Module deleted", null);
    }

    @PostMapping("/lessons")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<LessonResponse> createLesson(@Valid @RequestBody CreateLessonRequest request) {
        return ApiResponse.success("Lesson created", courseService.createLesson(request));
    }

    @GetMapping("/modules/{moduleId}/lessons")
    public ApiResponse<List<LessonResponse>> getLessons(@PathVariable UUID moduleId) {
        return ApiResponse.success(courseService.getLessons(moduleId));
    }

    @GetMapping("/lessons/{id}")
    public ApiResponse<LessonResponse> getLesson(@PathVariable UUID id) {
        return ApiResponse.success(courseService.getLesson(id));
    }

    @PutMapping("/lessons/{id}")
    public ApiResponse<LessonResponse> updateLesson(@PathVariable UUID id,
                                                    @Valid @RequestBody CreateLessonRequest request) {
        return ApiResponse.success("Lesson updated", courseService.updateLesson(id, request));
    }

    @DeleteMapping("/lessons/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteLesson(@PathVariable UUID id) {
        courseService.deleteLesson(id);
        return ApiResponse.success("Lesson deleted", null);
    }

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CategoryResponse> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        return ApiResponse.success("Category created", courseService.createCategory(request));
    }

    @GetMapping("/categories")
    public ApiResponse<List<CategoryResponse>> getRootCategories() {
        return ApiResponse.success(courseService.getRootCategories());
    }

    @GetMapping("/categories/{parentId}/subcategories")
    public ApiResponse<List<CategoryResponse>> getSubcategories(@PathVariable UUID parentId) {
        return ApiResponse.success(courseService.getSubcategories(parentId));
    }

    @GetMapping("/categories/{id}")
    public ApiResponse<CategoryResponse> getCategory(@PathVariable UUID id) {
        return ApiResponse.success(courseService.getCategory(id));
    }

    @PutMapping("/categories/{id}")
    public ApiResponse<CategoryResponse> updateCategory(@PathVariable UUID id,
                                                        @Valid @RequestBody CreateCategoryRequest request) {
        return ApiResponse.success("Category updated", courseService.updateCategory(id, request));
    }

    @DeleteMapping("/categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteCategory(@PathVariable UUID id) {
        courseService.deleteCategory(id);
        return ApiResponse.success("Category deleted", null);
    }
}
