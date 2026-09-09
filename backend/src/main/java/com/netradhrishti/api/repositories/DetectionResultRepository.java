package com.netradhrishti.api.repositories;

import com.netradhrishti.api.models.DetectionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface DetectionResultRepository extends JpaRepository<DetectionResult, Long> {
    List<DetectionResult> findByWorkId(Long workId);
    List<DetectionResult> findByWorkIdAndEngineType(Long workId, String engineType);

    @Query("SELECT d.engineType as engineType, COUNT(d) as count FROM DetectionResult d GROUP BY d.engineType")
    List<Map<String, Object>> countGroupedByEngineType();
}
