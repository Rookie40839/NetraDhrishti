package com.netradhrishti.api.repositories;

import com.netradhrishti.api.models.Inspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InspectionRepository extends JpaRepository<Inspection, Long> {
    @Query("SELECT i FROM Inspection i WHERE i.work.id = :workId")
    List<Inspection> findByWorkId(@Param("workId") Long workId);

    List<Inspection> findByAssignedTo(Long assignedTo);
    List<Inspection> findByStatus(String status);
    long countByStatus(String status);

    @Query("SELECT i FROM Inspection i WHERE i.work.id = :workId ORDER BY i.createdAt DESC")
    List<Inspection> findByWorkIdOrderByCreatedAtDesc(@Param("workId") Long workId);

    default Optional<Inspection> findFirstByWorkIdOrderByCreatedAtDesc(Long workId) {
        List<Inspection> list = findByWorkIdOrderByCreatedAtDesc(workId);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }
}
