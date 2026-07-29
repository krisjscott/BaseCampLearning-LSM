package com.tiesverse.backend.assessment.repository;

import com.tiesverse.backend.assessment.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuestionRepository extends JpaRepository<Question, UUID> {

    List<Question> findByAssessmentIdOrderByOrderIndex(UUID assessmentId);
}
