package com.netradhrishti.api.repositories;

import com.netradhrishti.api.models.DuplicateCandidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DuplicateCandidateRepository extends JpaRepository<DuplicateCandidate, Long> {
    @Query("SELECT d FROM DuplicateCandidate d WHERE d.work.id = :workId ORDER BY d.overallSimilarity DESC")
    List<DuplicateCandidate> findByWorkIdOrderByOverallSimilarityDesc(@Param("workId") Long workId);

    List<DuplicateCandidate> findByStatus(String status);
    long countByStatus(String status);
}
