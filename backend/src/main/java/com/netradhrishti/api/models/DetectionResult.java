package com.netradhrishti.api.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "detection_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetectionResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "work_id")
    @JsonIgnore
    private Work work;

    @Column(name = "engine_type", nullable = false)
    private String engineType; // COST, DUPLICATE, DELAY, FUND_FLOW, COMPLIANCE

    private Integer score;
    private String severity;

    @Column(name = "reason_code")
    private String reasonCode;

    @Column(columnDefinition = "text")
    private String description;

    @Column(columnDefinition = "jsonb")
    private String evidence;

    private Integer confidence;

    @Column(name = "model_version")
    private String modelVersion;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getWorkId() {
        return work != null ? work.getId() : null;
    }
}
