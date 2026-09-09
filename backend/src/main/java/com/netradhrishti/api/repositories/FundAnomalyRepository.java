package com.netradhrishti.api.repositories;

import com.netradhrishti.api.models.FundAnomaly;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FundAnomalyRepository extends JpaRepository<FundAnomaly, Long> {
    @Query("SELECT f FROM FundAnomaly f WHERE f.work.id = :workId")
    List<FundAnomaly> findByWorkId(@Param("workId") Long workId);
}
