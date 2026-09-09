package com.netradhrishti.api.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "works")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Work {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "unique_work_number", unique = true, nullable = false)
    private String uniqueWorkNumber;

    @Column(name = "work_name", nullable = false)
    private String workName;

    @Column(name = "work_description", columnDefinition = "text")
    private String workDescription;

    @Column(name = "work_category")
    private String workCategory;

    @Column(name = "state")
    private String state;

    @Column(name = "implementing_district")
    private String implementingDistrict;

    @Column(name = "nodal_district")
    private String nodalDistrict;

    @Column(name = "constituency")
    private String constituency;

    @Column(name = "house_name")
    private String houseName;

    @Column(name = "mp_name")
    private String mpName;

    @Column(name = "implementing_agency_name")
    private String implementingAgencyName;

    @Column(name = "sanction_amount")
    private Double sanctionAmount;

    @Column(name = "actual_expenditure")
    private Double actualExpenditure;

    @Column(name = "released_amount")
    private Double releasedAmount;

    @Column(name = "recommendation_date")
    private LocalDate recommendationDate;

    @Column(name = "administrative_approval_date")
    private LocalDate administrativeApprovalDate;

    @Column(name = "sanction_date")
    private LocalDate sanctionDate;

    @Column(name = "commencement_date")
    private LocalDate commencementDate;

    @Column(name = "latest_progress_date")
    private LocalDate latestProgressDate;

    @Column(name = "completion_date")
    private LocalDate completionDate;

    @Column(name = "final_payment_date")
    private LocalDate finalPaymentDate;

    @Column(name = "completion_marking_date")
    private LocalDate completionMarkingDate;

    @Column(name = "handover_date")
    private LocalDate handoverDate;

    @Column(name = "work_status")
    private String workStatus;

    @Column(name = "financial_year")
    private String financialYear;

    @Column(name = "image_uploaded")
    private String imageUploaded;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "data_confidence")
    private Integer dataConfidence;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // --- Backward compatibility getters & aliases ---
    public String getName() {
        return workName;
    }
    public void setName(String name) {
        this.workName = name;
    }

    public String getCategory() {
        return workCategory;
    }
    public void setCategory(String category) {
        this.workCategory = category;
    }

    public String getStatus() {
        return workStatus;
    }
    public void setStatus(String status) {
        this.workStatus = status;
    }

    public String getDistrict() {
        return implementingDistrict;
    }
    public void setDistrict(String district) {
        this.implementingDistrict = district;
    }

    public String getContractor() {
        return implementingAgencyName;
    }
    public void setContractor(String contractor) {
        this.implementingAgencyName = contractor;
    }

    public String getWorkCode() {
        return uniqueWorkNumber;
    }
    public void setWorkCode(String workCode) {
        this.uniqueWorkNumber = workCode;
    }

    public Double getSanctionedCost() {
        return sanctionAmount;
    }
    public void setSanctionedCost(Double sanctionedCost) {
        this.sanctionAmount = sanctionedCost;
    }

    public Double getEstimatedCost() {
        return actualExpenditure;
    }
    public void setEstimatedCost(Double estimatedCost) {
        this.actualExpenditure = estimatedCost;
    }

    public LocalDate getStartDate() {
        return commencementDate;
    }
    public void setStartDate(LocalDate startDate) {
        this.commencementDate = startDate;
    }

    public LocalDate getEndDate() {
        return completionDate;
    }
    public void setEndDate(LocalDate endDate) {
        this.completionDate = endDate;
    }
}
