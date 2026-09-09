package com.netradhrishti.api.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "risk_scores")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RiskScore {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "work_id")
    @JsonIgnore
    private Work work;

    @Column(name = "risk_score")
    private Integer riskScore;

    @Column(name = "impact_score")
    private Integer impactScore;

    @Column(name = "priority_score")
    private Integer priorityScore;

    @Column(name = "risk_level")
    private String riskLevel;

    @Column(name = "cost_score")
    private Integer costScore = 0;

    @Column(name = "delay_score")
    private Integer delayScore = 0;

    @Column(name = "fund_score")
    private Integer fundScore = 0;

    @Column(name = "duplicate_score")
    private Integer duplicateScore = 0;

    @Column(name = "compliance_score")
    private Integer complianceScore = 0;

    @Column(name = "data_confidence")
    private Integer dataConfidence = 0;

    @Column(name = "reason_codes", columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    private String reasonCodes;

    @Column(name = "inspection_mandatory")
    private Boolean inspectionMandatory = false;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt = LocalDateTime.now();

    @Column(name = "model_version")
    private String modelVersion;

    // Helper getter for work ID
    public Long getWorkId() {
        return work != null ? work.getId() : null;
    }

    // --- Backward compatibility aliases ---
    public Double getTotalRiskScore() {
        return riskScore != null ? riskScore.doubleValue() : null;
    }
    public void setTotalRiskScore(Double totalRiskScore) {
        this.riskScore = totalRiskScore != null ? totalRiskScore.intValue() : null;
    }

    public String getRiskCategory() {
        return riskLevel;
    }
    public void setRiskCategory(String riskCategory) {
        this.riskLevel = riskCategory;
    }

    public String getContributingFactors() {
        return reasonCodes;
    }
    public void setContributingFactors(String contributingFactors) {
        this.reasonCodes = contributingFactors;
    }
}
