package com.tiesverse.backend.assessment.repository;

import com.tiesverse.backend.assessment.entity.AssessmentResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssessmentResultRepository extends JpaRepository<AssessmentResult, UUID> {

    List<AssessmentResult> findByUserIdAndAssessmentId(UUID userId, UUID assessmentId);

    Optional<AssessmentResult> findTopByUserIdAndAssessmentIdOrderByAttemptNumberDesc(UUID userId, UUID assessmentId);

    long countByAssessmentIdAndPassedTrue(UUID assessmentId);

    @Query("select coalesce(sum(ar.score), 0) from AssessmentResult ar where ar.userId = :userId and ar.passed = true")
    Long sumPassedScoresByUserId(@Param("userId") UUID userId);
}
