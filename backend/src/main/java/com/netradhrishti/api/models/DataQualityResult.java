package com.netradhrishti.api.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "data_quality_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DataQualityResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "work_id")
    @JsonIgnore
    private Work work;

    @Column(name = "field_name")
    private String fieldName;

    @Column(name = "issue_type")
    private String issueType;

    private String severity;

    @Column(columnDefinition = "text")
    private String message;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getWorkId() {
        return work != null ? work.getId() : null;
    }
}
