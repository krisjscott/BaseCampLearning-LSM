package com.tiesverse.backend.enrollment.mapper;

import com.tiesverse.backend.enrollment.dto.response.EnrollmentResponse;
import com.tiesverse.backend.enrollment.dto.response.LearningPathResponse;
import com.tiesverse.backend.enrollment.entity.Enrollment;
import com.tiesverse.backend.enrollment.entity.LearningPath;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EnrollmentMapper {

    @Mapping(target = "userName", ignore = true)
    @Mapping(target = "courseTitle", ignore = true)
    @Mapping(target = "courseThumbnail", ignore = true)
    EnrollmentResponse toEnrollmentResponse(Enrollment enrollment);

    List<EnrollmentResponse> toEnrollmentResponseList(List<Enrollment> enrollments);

    @Mapping(target = "courseIds", ignore = true)
    LearningPathResponse toLearningPathResponse(LearningPath learningPath);

    List<LearningPathResponse> toLearningPathResponseList(List<LearningPath> learningPaths);
}
