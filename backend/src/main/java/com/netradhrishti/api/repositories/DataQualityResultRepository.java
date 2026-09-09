package com.netradhrishti.api.repositories;

import com.netradhrishti.api.models.DataQualityResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface DataQualityResultRepository extends JpaRepository<DataQualityResult, Long> {
    List<DataQualityResult> findByWorkId(Long workId);

    @Query("SELECT d.issueType as issueType, COUNT(d) as count FROM DataQualityResult d GROUP BY d.issueType")
    List<Map<String, Object>> countGroupedByIssueType();

    @Query("SELECT d.severity as severity, COUNT(d) as count FROM DataQualityResult d GROUP BY d.severity")
    List<Map<String, Object>> countGroupedBySeverity();
}
