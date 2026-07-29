package com.tiesverse.backend.course.mapper;

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
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface CourseMapper {

    Course toEntity(CreateCourseRequest request);

    CourseResponse toResponse(Course entity);

    CourseModule toEntity(CreateModuleRequest request);

    ModuleResponse toModuleResponse(CourseModule entity);

    Lesson toEntity(CreateLessonRequest request);

    LessonResponse toLessonResponse(Lesson entity);

    Category toEntity(CreateCategoryRequest request);

    CategoryResponse toCategoryResponse(Category entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(UpdateCourseRequest request, @MappingTarget Course entity);
}
