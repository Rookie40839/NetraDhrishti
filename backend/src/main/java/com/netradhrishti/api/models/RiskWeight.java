package com.netradhrishti.api.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "risk_weights")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RiskWeight {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "cost_w")
    private Double costW = 0.30;

    @Column(name = "delay_w")
    private Double delayW = 0.25;

    @Column(name = "fund_w")
    private Double fundW = 0.20;

    @Column(name = "duplicate_w")
    private Double duplicateW = 0.15;

    @Column(name = "compliance_w")
    private Double complianceW = 0.10;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "updated_by")
    private Long updatedBy;
}
