package com.netradhrishti.api.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "work_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "work_id")
    @JsonIgnore
    private Work work;

    @Column(name = "progress_date")
    private LocalDate progressDate;

    @Column(name = "physical_progress")
    private Double physicalProgress;

    @Column(name = "financial_progress")
    private Double financialProgress;

    @Column(name = "work_status")
    private String workStatus;

    @Column(columnDefinition = "text")
    private String remarks;

    @Column(name = "source_reference")
    private String sourceReference;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getWorkId() {
        return work != null ? work.getId() : null;
    }
}
