package com.netradhrishti.api.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "compliance_flags")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceFlag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "work_id")
    @JsonIgnore
    private Work work;

    @Column(name = "rule_id")
    private String ruleId;

    @Column(name = "triggered")
    private Boolean triggered = false;

    private String severity;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "evidence", columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    private String evidence;

    @Column(name = "observed_value")
    private String observedValue;

    @Column(name = "expected_value")
    private String expectedValue;

    private Integer confidence;

    @Column(name = "review_status")
    private String reviewStatus = "PENDING";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getWorkId() {
        return work != null ? work.getId() : null;
    }

    // Compatibility aliases
    public String getFlaggedDescription() {
        return description;
    }
    public void setFlaggedDescription(String flaggedDescription) {
        this.description = flaggedDescription;
    }

    public String getStatus() {
        return reviewStatus;
    }
    public void setStatus(String status) {
        this.reviewStatus = status;
    }
}
