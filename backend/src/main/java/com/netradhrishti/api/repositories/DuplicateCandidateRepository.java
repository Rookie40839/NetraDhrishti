package com.netradhrishti.api.repositories;

import com.netradhrishti.api.models.DuplicateCandidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DuplicateCandidateRepository extends JpaRepository<DuplicateCandidate, Long> {
    List<DuplicateCandidate> findByWorkIdOrderByOverallSimilarityDesc(Long workId);
    List<DuplicateCandidate> findByStatus(String status);
    long countByStatus(String status);
}
