package com.netradhrishti.api.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "fund_releases")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FundRelease {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "work_id")
    @JsonIgnore
    private Work work;

    @Column(name = "installment_number")
    private Integer installmentNumber;

    private Double amount;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "transaction_type")
    private String transactionType = "Release";

    @Column(name = "source_reference")
    private String sourceReference;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getWorkId() {
        return work != null ? work.getId() : null;
    }
}
