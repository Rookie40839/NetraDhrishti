package com.netradhrishti.api.repositories;

import com.netradhrishti.api.models.Inspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InspectionRepository extends JpaRepository<Inspection, Long> {
    List<Inspection> findByWorkId(Long workId);
    List<Inspection> findByAssignedTo(Long assignedTo);
    List<Inspection> findByStatus(String status);
    long countByStatus(String status);
    Optional<Inspection> findFirstByWorkIdOrderByCreatedAtDesc(Long workId);
}
