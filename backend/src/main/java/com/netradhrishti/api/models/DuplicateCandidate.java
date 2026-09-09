package com.netradhrishti.api.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "duplicate_candidates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DuplicateCandidate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "work_id")
    @JsonIgnore
    private Work work;

    @ManyToOne
    @JoinColumn(name = "matched_work_id")
    private Work matchedWork;

    @Column(name = "text_similarity")
    private Double textSimilarity;

    @Column(name = "location_similarity")
    private Double locationSimilarity;

    @Column(name = "agency_similarity")
    private Double agencySimilarity;

    @Column(name = "amount_similarity")
    private Double amountSimilarity;

    @Column(name = "date_similarity")
    private Double dateSimilarity;

    @Column(name = "overall_similarity")
    private Double overallSimilarity;

    @Column(columnDefinition = "text")
    private String reason;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, CONFIRMED, REJECTED, ESCALATED

    @Column(name = "reviewed_by")
    private Long reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getWorkId() {
        return work != null ? work.getId() : null;
    }
}
