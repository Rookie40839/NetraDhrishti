package com.netradhrishti.api.repositories;

import com.netradhrishti.api.models.Work;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface WorkRepository extends JpaRepository<Work, Long>, JpaSpecificationExecutor<Work> {
    Page<Work> findAll(Specification<Work> spec, Pageable pageable);

    List<Work> findByImplementingDistrict(String district);
    List<Work> findByState(String state);
    List<Work> findByConstituency(String constituency);
    List<Work> findByMpName(String mpName);
    List<Work> findByFinancialYear(String financialYear);
    List<Work> findByImplementingAgencyName(String agencyName);

    @Query("SELECT DISTINCT w.state FROM Work w WHERE w.state IS NOT NULL ORDER BY w.state")
    List<String> findDistinctStates();

    @Query("SELECT DISTINCT w.implementingDistrict FROM Work w WHERE w.implementingDistrict IS NOT NULL ORDER BY w.implementingDistrict")
    List<String> findDistinctDistricts();

    @Query("SELECT DISTINCT w.financialYear FROM Work w WHERE w.financialYear IS NOT NULL ORDER BY w.financialYear DESC")
    List<String> findDistinctFinancialYears();

    @Query("SELECT DISTINCT w.workCategory FROM Work w WHERE w.workCategory IS NOT NULL ORDER BY w.workCategory")
    List<String> findDistinctCategories();

    @Query("SELECT DISTINCT w.implementingAgencyName FROM Work w WHERE w.implementingAgencyName IS NOT NULL ORDER BY w.implementingAgencyName")
    List<String> findDistinctAgencies();
}
