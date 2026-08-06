package com.tiesverse.backend.contest.repository;

import com.tiesverse.backend.contest.entity.Contest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContestRepository extends JpaRepository<Contest, UUID> {

    List<Contest> findByCourseIdOrderByStartAtDesc(UUID courseId);

    List<Contest> findAllByOrderByStartAtDesc();
}
