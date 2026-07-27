package com.tiesverse.backend.assessment.service;

import com.tiesverse.backend.assessment.dto.request.CreateAssessmentRequest;
import com.tiesverse.backend.assessment.dto.request.CreateOptionRequest;
import com.tiesverse.backend.assessment.dto.request.CreateQuestionRequest;
import com.tiesverse.backend.assessment.dto.request.SubmitAnswerRequest;
import com.tiesverse.backend.assessment.dto.request.SubmitAssessmentRequest;
import com.tiesverse.backend.assessment.dto.response.AssessmentResponse;
import com.tiesverse.backend.assessment.dto.response.AssessmentResultResponse;
import com.tiesverse.backend.assessment.dto.response.QuestionResponse;
import com.tiesverse.backend.assessment.entity.Answer;
import com.tiesverse.backend.assessment.entity.Assessment;
import com.tiesverse.backend.assessment.entity.AssessmentResult;
import com.tiesverse.backend.assessment.entity.Question;
import com.tiesverse.backend.assessment.entity.QuestionOption;
import com.tiesverse.backend.assessment.mapper.AssessmentMapper;
import com.tiesverse.backend.assessment.repository.AnswerRepository;
import com.tiesverse.backend.assessment.repository.AssessmentRepository;
import com.tiesverse.backend.assessment.repository.AssessmentResultRepository;
import com.tiesverse.backend.assessment.repository.QuestionOptionRepository;
import com.tiesverse.backend.assessment.repository.QuestionRepository;
import com.tiesverse.backend.common.exception.BadRequestException;
import com.tiesverse.backend.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssessmentServiceImpl implements AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final AssessmentResultRepository assessmentResultRepository;
    private final AnswerRepository answerRepository;
    private final AssessmentMapper assessmentMapper;

    @Override
    @Transactional
    public AssessmentResponse createAssessment(CreateAssessmentRequest request) {
        Assessment assessment = assessmentMapper.toAssessment(request);
        assessment = assessmentRepository.save(assessment);
        return assessmentMapper.toAssessmentResponse(assessment);
    }

    @Override
    @Transactional(readOnly = true)
    public AssessmentResponse getAssessment(UUID assessmentId) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment", "id", assessmentId));

        AssessmentResponse response = assessmentMapper.toAssessmentResponse(assessment);
        List<Question> questions = questionRepository.findByAssessmentIdOrderByOrderIndex(assessmentId);
        List<QuestionResponse> questionResponses = questions.stream().map(question -> {
            QuestionResponse qr = assessmentMapper.toQuestionResponse(question);
            List<QuestionOption> options = questionOptionRepository.findByQuestionId(question.getId());
            qr.setOptions(assessmentMapper.toOptionResponseList(options));
            return qr;
        }).toList();
        response.setQuestions(questionResponses);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssessmentResponse> getAssessmentsByCourse(UUID courseId) {
        List<Assessment> assessments = assessmentRepository.findByCourseId(courseId);
        return assessments.stream()
                .map(assessmentMapper::toAssessmentResponse)
                .toList();
    }

    @Override
    @Transactional
    public AssessmentResponse updateAssessment(UUID assessmentId, CreateAssessmentRequest request) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment", "id", assessmentId));

        assessment.setTitle(request.getTitle());
        assessment.setDescription(request.getDescription());
        assessment.setCourseId(request.getCourseId());
        assessment.setType(request.getType());
        assessment.setPassingScore(request.getPassingScore());
        assessment.setTimeLimitMinutes(request.getTimeLimitMinutes());
        assessment.setMaxAttempts(request.getMaxAttempts());

        assessment = assessmentRepository.save(assessment);
        return assessmentMapper.toAssessmentResponse(assessment);
    }

    @Override
    @Transactional
    public void deleteAssessment(UUID assessmentId) {
        if (!assessmentRepository.existsById(assessmentId)) {
            throw new ResourceNotFoundException("Assessment", "id", assessmentId);
        }
        assessmentRepository.deleteById(assessmentId);
    }

    @Override
    @Transactional
    public QuestionResponse createQuestion(UUID assessmentId, CreateQuestionRequest request) {
        assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment", "id", assessmentId));

        Question question = assessmentMapper.toQuestion(request);
        question.setAssessmentId(assessmentId);
        Question savedQuestion = questionRepository.save(question);

        if (request.getOptions() != null && !request.getOptions().isEmpty()) {
            List<QuestionOption> options = request.getOptions().stream()
                    .map(opt -> QuestionOption.builder()
                            .questionId(savedQuestion.getId())
                            .optionText(opt.getOptionText())
                            .correct(opt.isCorrect())
                            .build())
                    .toList();
            questionOptionRepository.saveAll(options);
        }

        QuestionResponse response = assessmentMapper.toQuestionResponse(savedQuestion);
        response.setOptions(assessmentMapper.toOptionResponseList(
                questionOptionRepository.findByQuestionId(savedQuestion.getId())));
        return response;
    }

    @Override
    @Transactional
    public QuestionResponse updateQuestion(UUID questionId, CreateQuestionRequest request) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", questionId));

        question.setQuestionText(request.getQuestionText());
        question.setQuestionType(request.getQuestionType());
        question.setPoints(request.getPoints());
        question.setOrderIndex(request.getOrderIndex());
        question = questionRepository.save(question);

        if (request.getOptions() != null && !request.getOptions().isEmpty()) {
            List<QuestionOption> existingOptions = questionOptionRepository.findByQuestionId(questionId);
            questionOptionRepository.deleteAll(existingOptions);

            List<QuestionOption> newOptions = request.getOptions().stream()
                    .map(opt -> QuestionOption.builder()
                            .questionId(questionId)
                            .optionText(opt.getOptionText())
                            .correct(opt.isCorrect())
                            .build())
                    .toList();
            questionOptionRepository.saveAll(newOptions);
        }

        QuestionResponse response = assessmentMapper.toQuestionResponse(question);
        response.setOptions(assessmentMapper.toOptionResponseList(
                questionOptionRepository.findByQuestionId(questionId)));
        return response;
    }

    @Override
    @Transactional
    public void deleteQuestion(UUID questionId) {
        if (!questionRepository.existsById(questionId)) {
            throw new ResourceNotFoundException("Question", "id", questionId);
        }
        questionRepository.deleteById(questionId);
    }

    @Override
    @Transactional
    public AssessmentResultResponse submitAssessment(UUID userId, SubmitAssessmentRequest request) {
        Assessment assessment = assessmentRepository.findById(request.getAssessmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Assessment", "id", request.getAssessmentId()));

        int attemptNumber = assessmentResultRepository
                .findTopByUserIdAndAssessmentIdOrderByAttemptNumberDesc(userId, request.getAssessmentId())
                .map(last -> last.getAttemptNumber() + 1)
                .orElse(1);

        if (assessment.getMaxAttempts() != null && attemptNumber > assessment.getMaxAttempts()) {
            throw new BadRequestException("Maximum number of attempts exceeded");
        }

        List<Question> questions = questionRepository.findByAssessmentIdOrderByOrderIndex(request.getAssessmentId());
        Map<UUID, Question> questionMap = questions.stream()
                .collect(Collectors.toMap(Question::getId, q -> q));

        AssessmentResult result = AssessmentResult.builder()
                .userId(userId)
                .assessmentId(request.getAssessmentId())
                .attemptNumber(attemptNumber)
                .submittedAt(LocalDateTime.now())
                .build();
        result = assessmentResultRepository.save(result);

        int totalScore = 0;
        List<Answer> answers = new ArrayList<>();

        for (SubmitAnswerRequest answerRequest : request.getAnswers()) {
            Question question = questionMap.get(answerRequest.getQuestionId());
            if (question == null) continue;

            boolean isCorrect = false;
            int points = 0;

            if (answerRequest.getSelectedOptionId() != null) {
                QuestionOption selectedOption = questionOptionRepository.findById(answerRequest.getSelectedOptionId())
                        .orElse(null);
                if (selectedOption != null && selectedOption.isCorrect()) {
                    isCorrect = true;
                    points = question.getPoints() != null ? question.getPoints() : 0;
                }
            }

            totalScore += points;

            Answer answer = Answer.builder()
                    .resultId(result.getId())
                    .questionId(answerRequest.getQuestionId())
                    .answerText(answerRequest.getAnswerText())
                    .selectedOptionId(answerRequest.getSelectedOptionId())
                    .correct(isCorrect)
                    .points(points)
                    .build();
            answers.add(answer);
        }

        answerRepository.saveAll(answers);

        result.setScore(totalScore);
        result.setPassed(assessment.getPassingScore() != null && totalScore >= assessment.getPassingScore());
        result = assessmentResultRepository.save(result);

        AssessmentResultResponse response = assessmentMapper.toAssessmentResultResponse(result);
        response.setAssessmentTitle(assessment.getTitle());
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public AssessmentResultResponse getResult(UUID resultId) {
        AssessmentResult result = assessmentResultRepository.findById(resultId)
                .orElseThrow(() -> new ResourceNotFoundException("AssessmentResult", "id", resultId));

        AssessmentResultResponse response = assessmentMapper.toAssessmentResultResponse(result);
        assessmentRepository.findById(result.getAssessmentId())
                .ifPresent(a -> response.setAssessmentTitle(a.getTitle()));
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssessmentResultResponse> getResultHistory(UUID userId, UUID assessmentId) {
        List<AssessmentResult> results = assessmentResultRepository.findByUserIdAndAssessmentId(userId, assessmentId);
        return assessmentMapper.toAssessmentResultResponseList(results);
    }
}
