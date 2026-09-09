package com.netradhrishti.api.repositories;

import com.netradhrishti.api.models.FundRelease;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FundReleaseRepository extends JpaRepository<FundRelease, Long> {
    List<FundRelease> findByWorkIdOrderByReleaseDateAsc(Long workId);
}
