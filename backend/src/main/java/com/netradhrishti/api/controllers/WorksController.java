package com.netradhrishti.api.controllers;

import com.netradhrishti.api.models.*;
import com.netradhrishti.api.repositories.*;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/works")
@CrossOrigin(origins = "*")
public class WorksController {

    @Autowired
    private WorkRepository workRepository;
    @Autowired
    private RiskScoreRepository riskScoreRepository;
    @Autowired
    private ComplianceFlagRepository complianceFlagRepository;
    @Autowired
    private FundReleaseRepository fundReleaseRepository;
    @Autowired
    private FundAnomalyRepository fundAnomalyRepository;
    @Autowired
    private WorkProgressRepository workProgressRepository;
    @Autowired
    private DuplicateCandidateRepository duplicateCandidateRepository;
    @Autowired
    private DataQualityResultRepository dataQualityResultRepository;
    @Autowired
    private InspectionRepository inspectionRepository;

    public record WorkDTO(Work work, RiskScore riskScore, List<ComplianceFlag> flags) {}

    public record WorkPageResponse(
            List<WorkDTO> content,
            int page,
            int size,
            long totalElements,
            int totalPages
    ) {}

    @GetMapping
    public ResponseEntity<WorkPageResponse> getAllWorks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String constituency,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String agency,
            @RequestParam(required = false) String financialYear,
            @RequestParam(required = false) String riskLevel
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), sort);

        Specification<Work> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("workName")), pattern);
                Predicate codeMatch = cb.like(cb.lower(root.get("uniqueWorkNumber")), pattern);
                Predicate agencyMatch = cb.like(cb.lower(root.get("implementingAgencyName")), pattern);
                Predicate districtMatch = cb.like(cb.lower(root.get("implementingDistrict")), pattern);
                predicates.add(cb.or(nameMatch, codeMatch, agencyMatch, districtMatch));
            }

            if (state != null && !state.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("state"), state.trim()));
            }
            if (district != null && !district.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("implementingDistrict"), district.trim()));
            }
            if (constituency != null && !constituency.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("constituency"), constituency.trim()));
            }
            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("workStatus"), status.trim()));
            }
            if (category != null && !category.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("workCategory"), category.trim()));
            }
            if (agency != null && !agency.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("implementingAgencyName"), agency.trim()));
            }
            if (financialYear != null && !financialYear.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("financialYear"), financialYear.trim()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Work> workPage = workRepository.findAll(spec, pageable);

        List<Long> workIds = workPage.getContent().stream().map(Work::getId).collect(Collectors.toList());
        Map<Long, RiskScore> scoreMap = workIds.isEmpty() ? Collections.emptyMap() :
                riskScoreRepository.findByWorkIdIn(workIds).stream()
                        .filter(rs -> rs.getWorkId() != null)
                        .collect(Collectors.toMap(RiskScore::getWorkId, rs -> rs, (a, b) -> a));
        Map<Long, List<ComplianceFlag>> flagMap = workIds.isEmpty() ? Collections.emptyMap() :
                complianceFlagRepository.findByWorkIdIn(workIds).stream()
                        .filter(f -> f.getWorkId() != null)
                        .collect(Collectors.groupingBy(ComplianceFlag::getWorkId));

        List<WorkDTO> dtoList = workPage.getContent().stream().map(work -> {
            var score = scoreMap.get(work.getId());
            var flags = flagMap.getOrDefault(work.getId(), Collections.emptyList());
            return new WorkDTO(work, score, flags);
        }).filter(dto -> {
            if (riskLevel == null || riskLevel.trim().isEmpty()) return true;
            return dto.riskScore() != null && riskLevel.equalsIgnoreCase(dto.riskScore().getRiskLevel());
        }).collect(Collectors.toList());

        return ResponseEntity.ok(new WorkPageResponse(
                dtoList,
                workPage.getNumber(),
                workPage.getSize(),
                workPage.getTotalElements(),
                workPage.getTotalPages()
        ));
    }

    @GetMapping("/filters")
    public ResponseEntity<Map<String, Object>> getFilterOptions() {
        Map<String, Object> filters = new HashMap<>();
        filters.put("states", workRepository.findDistinctStates());
        filters.put("districts", workRepository.findDistinctDistricts());
        filters.put("categories", workRepository.findDistinctCategories());
        filters.put("agencies", workRepository.findDistinctAgencies());
        filters.put("financialYears", workRepository.findDistinctFinancialYears());
        filters.put("statuses", List.of("Recommended", "Sanctioned", "In Progress", "Completed", "Closed"));
        filters.put("riskLevels", List.of("CRITICAL", "HIGH", "MEDIUM", "LOW", "INSUFFICIENT_DATA"));
        return ResponseEntity.ok(filters);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkDTO> getWork(@PathVariable Long id) {
        var work = workRepository.findById(id);
        if (work.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        var score = riskScoreRepository.findByWorkId(id).orElse(null);
        var flags = complianceFlagRepository.findByWorkId(id);
        return ResponseEntity.ok(new WorkDTO(work.get(), score, flags));
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<Map<String, Object>> getWorkComprehensiveDetails(@PathVariable Long id) {
        var workOpt = workRepository.findById(id);
        if (workOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Work work = workOpt.get();
        var score = riskScoreRepository.findByWorkId(id).orElse(null);
        var flags = complianceFlagRepository.findByWorkId(id);
        var releases = fundReleaseRepository.findByWorkIdOrderByReleaseDateAsc(id);
        var anomalies = fundAnomalyRepository.findByWorkId(id);
        var duplicates = duplicateCandidateRepository.findByWorkIdOrderByOverallSimilarityDesc(id);
        var dqIssues = dataQualityResultRepository.findByWorkId(id);
        var latestInspection = inspectionRepository.findFirstByWorkIdOrderByCreatedAtDesc(id).orElse(null);
        var progressHistory = workProgressRepository.findByWorkIdOrderByProgressDateDesc(id);

        Map<String, Object> details = new HashMap<>();
        details.put("work", work);
        details.put("riskScore", score);
        details.put("flags", flags);
        details.put("fundReleases", releases);
        details.put("fundAnomalies", anomalies);
        details.put("duplicateCandidates", duplicates);
        details.put("dataQualityIssues", dqIssues);
        details.put("latestInspection", latestInspection);
        details.put("progressHistory", progressHistory);

        // Lifecycle summary
        Map<String, Object> lifecycle = new HashMap<>();
        lifecycle.put("recommendationDate", work.getRecommendationDate());
        lifecycle.put("administrativeApprovalDate", work.getAdministrativeApprovalDate());
        lifecycle.put("sanctionDate", work.getSanctionDate());
        lifecycle.put("commencementDate", work.getCommencementDate());
        lifecycle.put("completionDate", work.getCompletionDate());
        lifecycle.put("finalPaymentDate", work.getFinalPaymentDate());
        lifecycle.put("completionMarkingDate", work.getCompletionMarkingDate());
        lifecycle.put("handoverDate", work.getHandoverDate());
        details.put("lifecycle", lifecycle);

        return ResponseEntity.ok(details);
    }

    @GetMapping("/{id}/risk")
    public ResponseEntity<?> getWorkRisk(@PathVariable Long id) {
        var score = riskScoreRepository.findByWorkId(id);
        return score.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/compliance")
    public ResponseEntity<List<ComplianceFlag>> getWorkCompliance(@PathVariable Long id) {
        return ResponseEntity.ok(complianceFlagRepository.findByWorkId(id));
    }

    @GetMapping("/{id}/fund-flow")
    public ResponseEntity<Map<String, Object>> getWorkFundFlow(@PathVariable Long id) {
        var releases = fundReleaseRepository.findByWorkIdOrderByReleaseDateAsc(id);
        var anomalies = fundAnomalyRepository.findByWorkId(id);
        return ResponseEntity.ok(Map.of(
                "releases", releases,
                "anomalies", anomalies
        ));
    }

    @GetMapping("/{id}/lifecycle")
    public ResponseEntity<?> getWorkLifecycle(@PathVariable Long id) {
        var workOpt = workRepository.findById(id);
        if (workOpt.isEmpty()) return ResponseEntity.notFound().build();
        Work work = workOpt.get();

        Map<String, Object> lifecycle = new HashMap<>();
        lifecycle.put("recommendationDate", work.getRecommendationDate());
        lifecycle.put("approvalDate", work.getAdministrativeApprovalDate());
        lifecycle.put("sanctionDate", work.getSanctionDate());
        lifecycle.put("commencementDate", work.getCommencementDate());
        lifecycle.put("completionDate", work.getCompletionDate());
        lifecycle.put("finalPaymentDate", work.getFinalPaymentDate());
        lifecycle.put("handoverDate", work.getHandoverDate());
        lifecycle.put("status", work.getWorkStatus());
        return ResponseEntity.ok(lifecycle);
    }
}
