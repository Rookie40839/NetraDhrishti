package com.netradhrishti.api.repositories;

import com.netradhrishti.api.models.ComplianceFlag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface ComplianceFlagRepository extends JpaRepository<ComplianceFlag, Long> {
    @Query("SELECT f FROM ComplianceFlag f WHERE f.work.id = :workId")
    List<ComplianceFlag> findByWorkId(@Param("workId") Long workId);

    @Query("SELECT f FROM ComplianceFlag f WHERE f.work.id IN :workIds")
    List<ComplianceFlag> findByWorkIdIn(@Param("workIds") java.util.Collection<Long> workIds);
    List<ComplianceFlag> findByRuleId(String ruleId);
    long countByRuleId(String ruleId);
    long countByTriggeredTrue();

    @Query("SELECT f.ruleId as ruleId, COUNT(f) as count FROM ComplianceFlag f WHERE f.triggered = true GROUP BY f.ruleId")
    List<Map<String, Object>> countTriggeredGroupedByRuleId();
}
