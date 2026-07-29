package com.tiesverse.backend.course.service;

import com.tiesverse.backend.common.enums.CourseStatus;
import com.tiesverse.backend.common.enums.CourseVisibility;
import com.tiesverse.backend.common.exception.ConflictException;
import com.tiesverse.backend.common.exception.ResourceNotFoundException;
import com.tiesverse.backend.course.dto.request.CreateCategoryRequest;
import com.tiesverse.backend.course.dto.request.CreateCourseRequest;
import com.tiesverse.backend.course.dto.request.CreateLessonRequest;
import com.tiesverse.backend.course.dto.request.CreateModuleRequest;
import com.tiesverse.backend.course.dto.request.UpdateCourseRequest;
import com.tiesverse.backend.course.dto.response.CategoryResponse;
import com.tiesverse.backend.course.dto.response.CourseResponse;
import com.tiesverse.backend.course.dto.response.LessonResponse;
import com.tiesverse.backend.course.dto.response.ModuleResponse;
import com.tiesverse.backend.course.entity.Category;
import com.tiesverse.backend.course.entity.Course;
import com.tiesverse.backend.course.entity.CourseModule;
import com.tiesverse.backend.course.entity.Lesson;
import com.tiesverse.backend.course.mapper.CourseMapper;
import com.tiesverse.backend.course.repository.CategoryRepository;
import com.tiesverse.backend.course.repository.CourseModuleRepository;
import com.tiesverse.backend.course.repository.CourseRepository;
import com.tiesverse.backend.course.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final LessonRepository lessonRepository;
    private final CourseMapper courseMapper;

    @Override
    public CourseResponse createCourse(CreateCourseRequest request, UUID instructorId) {
        Course course = courseMapper.toEntity(request);
        course.setInstructorId(instructorId);
        course.setStatus(CourseStatus.DRAFT);
        if (course.getVisibility() == null) {
            course.setVisibility(CourseVisibility.PUBLIC);
        }
        course.setRating(BigDecimal.ZERO);
        course.setTotalEnrollments(0);
        return courseMapper.toResponse(courseRepository.save(course));
    }

    @Override
    @Transactional(readOnly = true)
    public CourseResponse getCourse(UUID id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
        return courseMapper.toResponse(course);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CourseResponse> getAllCourses(Pageable pageable) {
        return courseRepository.findAll(pageable).map(courseMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CourseResponse> searchCourses(String title, Pageable pageable) {
        return courseRepository.findByTitleContainingIgnoreCase(title, pageable)
                .map(courseMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponse> getCoursesByInstructor(UUID instructorId) {
        return courseRepository.findByInstructorId(instructorId).stream()
                .map(courseMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponse> getCoursesByOrganization(UUID organizationId) {
        return courseRepository.findByOrganizationId(organizationId).stream()
                .map(courseMapper::toResponse)
                .toList();
    }

    @Override
    public CourseResponse updateCourse(UUID id, UpdateCourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
        courseMapper.updateEntity(request, course);
        return courseMapper.toResponse(courseRepository.save(course));
    }

    @Override
    public void deleteCourse(UUID id) {
        if (!courseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Course", "id", id);
        }
        courseRepository.deleteById(id);
    }

    @Override
    public CourseResponse publishCourse(UUID id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
        course.setStatus(CourseStatus.PUBLISHED);
        return courseMapper.toResponse(courseRepository.save(course));
    }

    @Override
    public CourseResponse archiveCourse(UUID id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
        course.setStatus(CourseStatus.ARCHIVED);
        return courseMapper.toResponse(courseRepository.save(course));
    }

    @Override
    public ModuleResponse createModule(CreateModuleRequest request) {
        if (!courseRepository.existsById(request.getCourseId())) {
            throw new ResourceNotFoundException("Course", "id", request.getCourseId());
        }
        CourseModule module = courseMapper.toEntity(request);
        return courseMapper.toModuleResponse(courseModuleRepository.save(module));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModuleResponse> getModules(UUID courseId) {
        return courseModuleRepository.findByCourseIdOrderByOrderIndex(courseId).stream()
                .map(module -> {
                    ModuleResponse response = courseMapper.toModuleResponse(module);
                    List<Lesson> lessons = lessonRepository.findByModuleIdOrderByOrderIndex(module.getId());
                    response.setLessons(lessons.stream().map(courseMapper::toLessonResponse).toList());
                    return response;
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ModuleResponse getModule(UUID id) {
        CourseModule module = courseModuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", id));
        ModuleResponse response = courseMapper.toModuleResponse(module);
        List<Lesson> lessons = lessonRepository.findByModuleIdOrderByOrderIndex(module.getId());
        response.setLessons(lessons.stream().map(courseMapper::toLessonResponse).toList());
        return response;
    }

    @Override
    public ModuleResponse updateModule(UUID id, CreateModuleRequest request) {
        CourseModule module = courseModuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", id));
        module.setTitle(request.getTitle());
        module.setDescription(request.getDescription());
        module.setOrderIndex(request.getOrderIndex());
        return courseMapper.toModuleResponse(courseModuleRepository.save(module));
    }

    @Override
    public void deleteModule(UUID id) {
        if (!courseModuleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Module", "id", id);
        }
        courseModuleRepository.deleteById(id);
    }

    @Override
    public LessonResponse createLesson(CreateLessonRequest request) {
        if (!courseModuleRepository.existsById(request.getModuleId())) {
            throw new ResourceNotFoundException("Module", "id", request.getModuleId());
        }
        Lesson lesson = courseMapper.toEntity(request);
        return courseMapper.toLessonResponse(lessonRepository.save(lesson));
    }

    @Override
    @Transactional(readOnly = true)
    public List<LessonResponse> getLessons(UUID moduleId) {
        return lessonRepository.findByModuleIdOrderByOrderIndex(moduleId).stream()
                .map(courseMapper::toLessonResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LessonResponse getLesson(UUID id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", id));
        return courseMapper.toLessonResponse(lesson);
    }

    @Override
    public LessonResponse updateLesson(UUID id, CreateLessonRequest request) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", id));
        lesson.setTitle(request.getTitle());
        lesson.setDescription(request.getDescription());
        lesson.setContentUrl(request.getContentUrl());
        lesson.setContentType(request.getContentType());
        lesson.setDurationMinutes(request.getDurationMinutes());
        lesson.setOrderIndex(request.getOrderIndex());
        return courseMapper.toLessonResponse(lessonRepository.save(lesson));
    }

    @Override
    public void deleteLesson(UUID id) {
        if (!lessonRepository.existsById(id)) {
            throw new ResourceNotFoundException("Lesson", "id", id);
        }
        lessonRepository.deleteById(id);
    }

    @Override
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        categoryRepository.findByName(request.getName()).ifPresent(c -> {
            throw new ConflictException("Category with name '" + request.getName() + "' already exists");
        });
        Category category = courseMapper.toEntity(request);
        return courseMapper.toCategoryResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getRootCategories() {
        return categoryRepository.findByParentIdIsNull().stream()
                .map(category -> {
                    CategoryResponse response = courseMapper.toCategoryResponse(category);
                    response.setSubcategories(getSubcategoriesRecursive(category.getId()));
                    return response;
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getSubcategories(UUID parentId) {
        return categoryRepository.findByParentId(parentId).stream()
                .map(category -> {
                    CategoryResponse response = courseMapper.toCategoryResponse(category);
                    response.setSubcategories(getSubcategoriesRecursive(category.getId()));
                    return response;
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        CategoryResponse response = courseMapper.toCategoryResponse(category);
        response.setSubcategories(getSubcategoriesRecursive(category.getId()));
        return response;
    }

    @Override
    public CategoryResponse updateCategory(UUID id, CreateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setParentId(request.getParentId());
        return courseMapper.toCategoryResponse(categoryRepository.save(category));
    }

    @Override
    public void deleteCategory(UUID id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category", "id", id);
        }
        categoryRepository.deleteById(id);
    }

    private List<CategoryResponse> getSubcategoriesRecursive(UUID parentId) {
        List<Category> children = categoryRepository.findByParentId(parentId);
        List<CategoryResponse> responses = new ArrayList<>();
        for (Category child : children) {
            CategoryResponse response = courseMapper.toCategoryResponse(child);
            response.setSubcategories(getSubcategoriesRecursive(child.getId()));
            responses.add(response);
        }
        return responses;
    }
}
