package com.netradhrishti.api.repositories;

import com.netradhrishti.api.models.WorkProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkProgressRepository extends JpaRepository<WorkProgress, Long> {
    List<WorkProgress> findByWorkIdOrderByProgressDateDesc(Long workId);
    Optional<WorkProgress> findFirstByWorkIdOrderByProgressDateDesc(Long workId);
}
