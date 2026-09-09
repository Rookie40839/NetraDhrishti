package com.netradhrishti.api.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "fund_anomalies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FundAnomaly {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "work_id")
    @JsonIgnore
    private Work work;

    @Column(name = "anomaly_type", nullable = false)
    private String anomalyType;

    private Integer score;
    private String severity;

    @Column(name = "expected_value")
    private Double expectedValue;

    @Column(name = "actual_value")
    private Double actualValue;

    @Column(name = "amount_involved")
    private Double amountInvolved;

    @Column(name = "reason_code")
    private String reasonCode;

    @Column(columnDefinition = "text")
    private String description;

    private Integer confidence;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getWorkId() {
        return work != null ? work.getId() : null;
    }
}
