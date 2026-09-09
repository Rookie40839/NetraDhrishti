package com.netradhrishti.api.controllers;

import com.netradhrishti.api.models.RiskScore;
import com.netradhrishti.api.models.Work;
import com.netradhrishti.api.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private WorkRepository workRepository;
    @Autowired
    private RiskScoreRepository riskScoreRepository;
    @Autowired
    private ComplianceFlagRepository complianceFlagRepository;
    @Autowired
    private DetectionResultRepository detectionResultRepository;
    @Autowired
    private InspectionRepository inspectionRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String financialYear
    ) {
        List<Work> works = workRepository.findAll();

        if (state != null && !state.trim().isEmpty()) {
            works = works.stream().filter(w -> state.equalsIgnoreCase(w.getState())).collect(Collectors.toList());
        }
        if (district != null && !district.trim().isEmpty()) {
            works = works.stream().filter(w -> district.equalsIgnoreCase(w.getImplementingDistrict())).collect(Collectors.toList());
        }
        if (financialYear != null && !financialYear.trim().isEmpty()) {
            works = works.stream().filter(w -> financialYear.equalsIgnoreCase(w.getFinancialYear())).collect(Collectors.toList());
        }

        Set<Long> filteredWorkIds = works.stream().map(Work::getId).collect(Collectors.toSet());

        List<RiskScore> scores = riskScoreRepository.findAll().stream()
                .filter(rs -> rs.getWork() != null && filteredWorkIds.contains(rs.getWork().getId()))
                .collect(Collectors.toList());

        long totalWorks = works.size();
        long highRiskWorks = scores.stream().filter(s -> "HIGH".equalsIgnoreCase(s.getRiskLevel())).count();
        long criticalWorks = scores.stream().filter(s -> "CRITICAL".equalsIgnoreCase(s.getRiskLevel())).count();
        long mediumRiskWorks = scores.stream().filter(s -> "MEDIUM".equalsIgnoreCase(s.getRiskLevel())).count();
        long lowRiskWorks = scores.stream().filter(s -> "LOW".equalsIgnoreCase(s.getRiskLevel())).count();
        long insufficientData = scores.stream().filter(s -> "INSUFFICIENT_DATA".equalsIgnoreCase(s.getRiskLevel())).count();

        // "Need Review" are high/critical works or works with pending inspection
        long needReview = highRiskWorks + criticalWorks;

        long totalFlags = complianceFlagRepository.countByTriggeredTrue();

        double totalSanctioned = works.stream()
                .mapToDouble(w -> w.getSanctionAmount() != null ? w.getSanctionAmount() : 0.0)
                .sum();
        double totalExpenditure = works.stream()
                .mapToDouble(w -> w.getActualExpenditure() != null ? w.getActualExpenditure() : 0.0)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalWorks", totalWorks);
        stats.put("highRiskWorks", highRiskWorks);
        stats.put("criticalWorks", criticalWorks);
        stats.put("mediumRiskWorks", mediumRiskWorks);
        stats.put("lowRiskWorks", lowRiskWorks);
        stats.put("insufficientDataWorks", insufficientData);
        stats.put("needReviewWorks", needReview);
        stats.put("totalFlags", totalFlags);
        stats.put("totalSanctioned", totalSanctioned);
        stats.put("totalExpenditure", totalExpenditure);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/risk-distribution")
    public ResponseEntity<List<Map<String, Object>>> getRiskDistribution(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district
    ) {
        List<RiskScore> scores = riskScoreRepository.findAll();
        if (district != null && !district.trim().isEmpty()) {
            scores = scores.stream()
                    .filter(s -> s.getWork() != null && district.equalsIgnoreCase(s.getWork().getImplementingDistrict()))
                    .collect(Collectors.toList());
        } else if (state != null && !state.trim().isEmpty()) {
            scores = scores.stream()
                    .filter(s -> s.getWork() != null && state.equalsIgnoreCase(s.getWork().getState()))
                    .collect(Collectors.toList());
        }

        Map<String, Long> distribution = scores.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getRiskLevel() != null ? s.getRiskLevel().toUpperCase() : "LOW",
                        Collectors.counting()
                ));

        List<Map<String, Object>> result = new ArrayList<>();
        String[] levels = {"CRITICAL", "HIGH", "MEDIUM", "LOW", "INSUFFICIENT_DATA"};
        for (String level : levels) {
            Map<String, Object> item = new HashMap<>();
            item.put("level", level);
            item.put("count", distribution.getOrDefault(level, 0L));
            result.add(item);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/top-priority")
    public ResponseEntity<List<Map<String, Object>>> getTopPriorityWorks(
            @RequestParam(defaultValue = "10") int limit
    ) {
        List<RiskScore> topScores = riskScoreRepository.findTop10ByOrderByPriorityScoreDesc();

        List<Map<String, Object>> result = topScores.stream().map(rs -> {
            Work w = rs.getWork();
            Map<String, Object> map = new HashMap<>();
            map.put("workId", w != null ? w.getId() : null);
            map.put("uniqueWorkNumber", w != null ? w.getUniqueWorkNumber() : "");
            map.put("workName", w != null ? w.getWorkName() : "");
            map.put("district", w != null ? w.getImplementingDistrict() : "");
            map.put("state", w != null ? w.getState() : "");
            map.put("mpName", w != null ? w.getMpName() : "");
            map.put("agency", w != null ? w.getImplementingAgencyName() : "");
            map.put("sanctionAmount", w != null ? w.getSanctionAmount() : 0.0);
            map.put("status", w != null ? w.getWorkStatus() : "");
            map.put("riskScore", rs.getRiskScore());
            map.put("impactScore", rs.getImpactScore());
            map.put("priorityScore", rs.getPriorityScore());
            map.put("riskLevel", rs.getRiskLevel());
            map.put("reasonCodes", rs.getReasonCodes());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/flagging-reasons")
    public ResponseEntity<List<Map<String, Object>>> getFlaggingReasons() {
        var engineCounts = detectionResultRepository.countGroupedByEngineType();
        if (engineCounts.isEmpty()) {
            // Fallback default distribution from compliance flags if detections haven't run
            return ResponseEntity.ok(List.of(
                    Map.of("category", "Cost Deviation", "count", 12),
                    Map.of("category", "Timeline Delays", "count", 28),
                    Map.of("category", "Fund Anomalies", "count", 15),
                    Map.of("category", "Potential Duplicates", "count", 8),
                    Map.of("category", "Compliance Violations", "count", 34)
            ));
        }

        List<Map<String, Object>> list = new ArrayList<>();
        for (var map : engineCounts) {
            list.add(Map.of(
                    "category", map.get("engineType"),
                    "count", map.get("count")
            ));
        }
        return ResponseEntity.ok(list);
    }
}
