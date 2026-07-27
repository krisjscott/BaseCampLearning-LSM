package com.tiesverse.backend.assessment.repository;

import com.tiesverse.backend.assessment.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, UUID> {

    List<Answer> findByResultId(UUID resultId);
}
