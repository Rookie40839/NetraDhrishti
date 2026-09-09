package com.netradhrishti.api.repositories;

import com.netradhrishti.api.models.RiskWeight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RiskWeightRepository extends JpaRepository<RiskWeight, Integer> {
    Optional<RiskWeight> findFirstByOrderByIdAsc();
}
