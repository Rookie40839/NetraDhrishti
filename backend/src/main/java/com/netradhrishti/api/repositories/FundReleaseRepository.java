package com.netradhrishti.api.repositories;

import com.netradhrishti.api.models.FundRelease;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FundReleaseRepository extends JpaRepository<FundRelease, Long> {
    @Query("SELECT f FROM FundRelease f WHERE f.work.id = :workId ORDER BY f.releaseDate ASC")
    List<FundRelease> findByWorkIdOrderByReleaseDateAsc(@Param("workId") Long workId);
}
