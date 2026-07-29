package com.tiesverse.backend.progress.mapper;

import com.tiesverse.backend.progress.dto.response.CourseProgressResponse;
import com.tiesverse.backend.progress.dto.response.LessonProgressResponse;
import com.tiesverse.backend.progress.entity.CourseProgress;
import com.tiesverse.backend.progress.entity.LessonProgress;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProgressMapper {

    @Mapping(target = "courseTitle", ignore = true)
    @Mapping(target = "lastLessonTitle", ignore = true)
    CourseProgressResponse toCourseProgressResponse(CourseProgress courseProgress);

    List<CourseProgressResponse> toCourseProgressResponseList(List<CourseProgress> courseProgressList);

    @Mapping(target = "lessonTitle", ignore = true)
    LessonProgressResponse toLessonProgressResponse(LessonProgress lessonProgress);

    List<LessonProgressResponse> toLessonProgressResponseList(List<LessonProgress> lessonProgressList);
}
