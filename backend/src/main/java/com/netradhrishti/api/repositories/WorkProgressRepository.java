package com.netradhrishti.api.repositories;

import com.netradhrishti.api.models.WorkProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkProgressRepository extends JpaRepository<WorkProgress, Long> {
    @Query("SELECT p FROM WorkProgress p WHERE p.work.id = :workId ORDER BY p.progressDate DESC")
    List<WorkProgress> findByWorkIdOrderByProgressDateDesc(@Param("workId") Long workId);

    default Optional<WorkProgress> findFirstByWorkIdOrderByProgressDateDesc(Long workId) {
        List<WorkProgress> list = findByWorkIdOrderByProgressDateDesc(workId);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }
}
