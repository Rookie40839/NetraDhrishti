package com.netradhrishti.api.controllers;

import com.netradhrishti.api.models.RiskScore;
import com.netradhrishti.api.models.Work;
import com.netradhrishti.api.repositories.RiskScoreRepository;
import com.netradhrishti.api.repositories.WorkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private WorkRepository workRepository;

    @Autowired
    private RiskScoreRepository riskScoreRepository;

    @GetMapping("/district")
    public ResponseEntity<List<Map<String, Object>>> getDistrictAnalytics() {
        List<Work> works = workRepository.findAll();
        Map<Long, RiskScore> scoreMap = riskScoreRepository.findAll().stream()
                .filter(rs -> rs.getWork() != null)
                .collect(Collectors.toMap(rs -> rs.getWork().getId(), rs -> rs, (a, b) -> a));

        Map<String, List<Work>> grouped = works.stream()
                .filter(w -> w.getImplementingDistrict() != null)
                .collect(Collectors.groupingBy(Work::getImplementingDistrict));

        List<Map<String, Object>> result = new ArrayList<>();
        for (var entry : grouped.entrySet()) {
            String district = entry.getKey();
            List<Work> dWorks = entry.getValue();
            long count = dWorks.size();
            double sanctioned = dWorks.stream().mapToDouble(w -> w.getSanctionAmount() != null ? w.getSanctionAmount() : 0.0).sum();
            double expenditure = dWorks.stream().mapToDouble(w -> w.getActualExpenditure() != null ? w.getActualExpenditure() : 0.0).sum();

            long highRisk = dWorks.stream()
                    .map(w -> scoreMap.get(w.getId()))
                    .filter(rs -> rs != null && ("HIGH".equalsIgnoreCase(rs.getRiskLevel()) || "CRITICAL".equalsIgnoreCase(rs.getRiskLevel())))
                    .count();

            Map<String, Object> map = new HashMap<>();
            map.put("district", district);
            map.put("state", dWorks.get(0).getState());
            map.put("totalWorks", count);
            map.put("totalSanctioned", sanctioned);
            map.put("totalExpenditure", expenditure);
            map.put("highRiskWorks", highRisk);
            result.add(map);
        }

        result.sort((a, b) -> Long.compare((Long) b.get("highRiskWorks"), (Long) a.get("highRiskWorks")));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/agency")
    public ResponseEntity<List<Map<String, Object>>> getAgencyAnalytics() {
        List<Work> works = workRepository.findAll();
        Map<Long, RiskScore> scoreMap = riskScoreRepository.findAll().stream()
                .filter(rs -> rs.getWork() != null)
                .collect(Collectors.toMap(rs -> rs.getWork().getId(), rs -> rs, (a, b) -> a));

        Map<String, List<Work>> grouped = works.stream()
                .filter(w -> w.getImplementingAgencyName() != null)
                .collect(Collectors.groupingBy(Work::getImplementingAgencyName));

        List<Map<String, Object>> result = new ArrayList<>();
        for (var entry : grouped.entrySet()) {
            String agency = entry.getKey();
            List<Work> aWorks = entry.getValue();
            long count = aWorks.size();
            double sanctioned = aWorks.stream().mapToDouble(w -> w.getSanctionAmount() != null ? w.getSanctionAmount() : 0.0).sum();

            long highRisk = aWorks.stream()
                    .map(w -> scoreMap.get(w.getId()))
                    .filter(rs -> rs != null && ("HIGH".equalsIgnoreCase(rs.getRiskLevel()) || "CRITICAL".equalsIgnoreCase(rs.getRiskLevel())))
                    .count();

            double highRiskPct = count > 0 ? (double) highRisk / count * 100.0 : 0.0;

            Set<String> districts = aWorks.stream()
                    .map(Work::getImplementingDistrict)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            Map<String, Object> map = new HashMap<>();
            map.put("agencyName", agency);
            map.put("totalWorks", count);
            map.put("totalSanctioned", sanctioned);
            map.put("highRiskCount", highRisk);
            map.put("highRiskPercentage", Math.round(highRiskPct * 10.0) / 10.0);
            map.put("districtCount", districts.size());
            map.put("districts", districts);
            result.add(map);
        }

        result.sort((a, b) -> Long.compare((Long) b.get("highRiskCount"), (Long) a.get("highRiskCount")));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/mp")
    public ResponseEntity<List<Map<String, Object>>> getMpAnalytics() {
        List<Work> works = workRepository.findAll();
        Map<Long, RiskScore> scoreMap = riskScoreRepository.findAll().stream()
                .filter(rs -> rs.getWork() != null)
                .collect(Collectors.toMap(rs -> rs.getWork().getId(), rs -> rs, (a, b) -> a));

        Map<String, List<Work>> grouped = works.stream()
                .filter(w -> w.getMpName() != null)
                .collect(Collectors.groupingBy(Work::getMpName));

        List<Map<String, Object>> result = new ArrayList<>();
        for (var entry : grouped.entrySet()) {
            String mp = entry.getKey();
            List<Work> mWorks = entry.getValue();
            long count = mWorks.size();
            double sanctioned = mWorks.stream().mapToDouble(w -> w.getSanctionAmount() != null ? w.getSanctionAmount() : 0.0).sum();

            long highRisk = mWorks.stream()
                    .map(w -> scoreMap.get(w.getId()))
                    .filter(rs -> rs != null && ("HIGH".equalsIgnoreCase(rs.getRiskLevel()) || "CRITICAL".equalsIgnoreCase(rs.getRiskLevel())))
                    .count();

            Map<String, Object> map = new HashMap<>();
            map.put("mpName", mp);
            map.put("constituency", mWorks.get(0).getConstituency());
            map.put("state", mWorks.get(0).getState());
            map.put("totalWorks", count);
            map.put("totalSanctioned", sanctioned);
            map.put("highRiskWorks", highRisk);
            result.add(map);
        }

        result.sort((a, b) -> Long.compare((Long) b.get("totalWorks"), (Long) a.get("totalWorks")));
        return ResponseEntity.ok(result);
    }
}
