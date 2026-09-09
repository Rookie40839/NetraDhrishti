package com.netradhrishti.api.repositories;

import com.netradhrishti.api.models.DetectionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface DetectionResultRepository extends JpaRepository<DetectionResult, Long> {
    @Query("SELECT d FROM DetectionResult d WHERE d.work.id = :workId")
    List<DetectionResult> findByWorkId(@Param("workId") Long workId);

    @Query("SELECT d FROM DetectionResult d WHERE d.work.id = :workId AND d.engineType = :engineType")
    List<DetectionResult> findByWorkIdAndEngineType(@Param("workId") Long workId, @Param("engineType") String engineType);

    @Query("SELECT d.engineType as engineType, COUNT(d) as count FROM DetectionResult d GROUP BY d.engineType")
    List<Map<String, Object>> countGroupedByEngineType();
}
