package com.tiesverse.backend.assessment.mapper;

import com.tiesverse.backend.assessment.dto.request.CreateAssessmentRequest;
import com.tiesverse.backend.assessment.dto.request.CreateOptionRequest;
import com.tiesverse.backend.assessment.dto.request.CreateQuestionRequest;
import com.tiesverse.backend.assessment.dto.response.AssessmentResponse;
import com.tiesverse.backend.assessment.dto.response.AssessmentResultResponse;
import com.tiesverse.backend.assessment.dto.response.OptionResponse;
import com.tiesverse.backend.assessment.dto.response.QuestionResponse;
import com.tiesverse.backend.assessment.entity.Assessment;
import com.tiesverse.backend.assessment.entity.AssessmentResult;
import com.tiesverse.backend.assessment.entity.Question;
import com.tiesverse.backend.assessment.entity.QuestionOption;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AssessmentMapper {

    Assessment toAssessment(CreateAssessmentRequest request);

    @Mapping(target = "questions", ignore = true)
    AssessmentResponse toAssessmentResponse(Assessment assessment);

    Question toQuestion(CreateQuestionRequest request);

    @Mapping(target = "options", ignore = true)
    QuestionResponse toQuestionResponse(Question question);

    List<QuestionResponse> toQuestionResponseList(List<Question> questions);

    QuestionOption toQuestionOption(CreateOptionRequest request);

    OptionResponse toOptionResponse(QuestionOption option);

    List<OptionResponse> toOptionResponseList(List<QuestionOption> options);

    @Mapping(target = "assessmentTitle", ignore = true)
    AssessmentResultResponse toAssessmentResultResponse(AssessmentResult result);

    List<AssessmentResultResponse> toAssessmentResultResponseList(List<AssessmentResult> results);
}
