package com.netradhrishti.api.repositories;

import com.netradhrishti.api.models.RiskScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface RiskScoreRepository extends JpaRepository<RiskScore, Long> {
    Optional<RiskScore> findByWorkId(Long workId);

    long countByRiskLevel(String riskLevel);

    long countByRiskLevelIn(List<String> riskLevels);

    List<RiskScore> findTop10ByOrderByPriorityScoreDesc();

    @Query("SELECT r.riskLevel as level, COUNT(r) as count FROM RiskScore r GROUP BY r.riskLevel")
    List<Map<String, Object>> countGroupedByRiskLevel();
}
