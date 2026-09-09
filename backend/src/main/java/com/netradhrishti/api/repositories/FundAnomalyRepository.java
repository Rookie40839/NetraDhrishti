package com.netradhrishti.api.repositories;

import com.netradhrishti.api.models.FundAnomaly;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FundAnomalyRepository extends JpaRepository<FundAnomaly, Long> {
    List<FundAnomaly> findByWorkId(Long workId);
}
