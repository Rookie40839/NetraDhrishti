package com.netradhrishti.api.repositories;

import com.netradhrishti.api.models.RiskScore;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface RiskScoreRepository extends JpaRepository<RiskScore, Long> {
    @Query("SELECT r FROM RiskScore r WHERE r.work.id = :workId")
    Optional<RiskScore> findByWorkId(@Param("workId") Long workId);

    @Query("SELECT r FROM RiskScore r WHERE r.work.id IN :workIds")
    List<RiskScore> findByWorkIdIn(@Param("workIds") Collection<Long> workIds);

    @EntityGraph(attributePaths = {"work"})
    List<RiskScore> findAll();

    @EntityGraph(attributePaths = {"work"})
    List<RiskScore> findTop10ByOrderByPriorityScoreDesc();

    long countByRiskLevel(String riskLevel);

    long countByRiskLevelIn(List<String> riskLevels);

    @Query("SELECT r.riskLevel as level, COUNT(r) as count FROM RiskScore r GROUP BY r.riskLevel")
    List<Map<String, Object>> countGroupedByRiskLevel();
}
