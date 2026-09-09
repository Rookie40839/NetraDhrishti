package com.netradhrishti.api.repositories;

import com.netradhrishti.api.models.ComplianceFlag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface ComplianceFlagRepository extends JpaRepository<ComplianceFlag, Long> {
    List<ComplianceFlag> findByWorkId(Long workId);
    List<ComplianceFlag> findByRuleId(String ruleId);
    long countByRuleId(String ruleId);
    long countByTriggeredTrue();

    @Query("SELECT f.ruleId as ruleId, COUNT(f) as count FROM ComplianceFlag f WHERE f.triggered = true GROUP BY f.ruleId")
    List<Map<String, Object>> countTriggeredGroupedByRuleId();
}
