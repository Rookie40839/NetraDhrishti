package com.netradhrishti.api.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "compliance_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceRule {
    @Id
    @Column(name = "rule_id", length = 50)
    private String ruleId;

    @Column(name = "rule_name", nullable = false)
    private String ruleName;

    @Column(name = "rule_type", nullable = false)
    private String ruleType;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "source_reference")
    private String sourceReference;

    private String severity;

    private Boolean active = true;
}
