package com.netradhrishti.api.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "inspections")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Inspection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inspection_id")
    private Long inspectionId;

    @ManyToOne
    @JoinColumn(name = "work_id")
    @JsonIgnore
    private Work work;

    @Column(name = "assigned_to")
    private Long assignedTo;

    @Column(nullable = false)
    private String status = "Pending"; // Pending, InProgress, Completed

    @Column(columnDefinition = "text")
    private String remarks;

    @Column(columnDefinition = "text")
    private String findings;

    @Column(name = "evidence_references", columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    private String evidenceReferences;

    @Column(name = "review_decision")
    private String reviewDecision; // Confirmed, Needs verification, False positive, No action, Escalated

    @Column(name = "escalated_to")
    private Long escalatedTo;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public Long getId() {
        return inspectionId;
    }

    public Long getWorkId() {
        return work != null ? work.getId() : null;
    }

    // Compatibility aliases
    public Long getInspectorId() {
        return assignedTo;
    }
    public void setInspectorId(Long inspectorId) {
        this.assignedTo = inspectorId;
    }
}
