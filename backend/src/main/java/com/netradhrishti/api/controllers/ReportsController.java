package com.netradhrishti.api.controllers;

import com.netradhrishti.api.models.RiskScore;
import com.netradhrishti.api.models.Work;
import com.netradhrishti.api.repositories.RiskScoreRepository;
import com.netradhrishti.api.repositories.WorkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportsController {

    @Autowired
    private WorkRepository workRepository;

    @Autowired
    private RiskScoreRepository riskScoreRepository;

    public record ReportRequest(
            String reportType, // INSPECTION_PRIORITY, RISK_SUMMARY, COMPLIANCE_SUMMARY, FINANCIAL_SUMMARY
            String state,
            String district,
            String financialYear,
            String riskLevel,
            String format // CSV, JSON
    ) {}

    @PostMapping("/generate")
    public ResponseEntity<?> generateReport(@RequestBody ReportRequest req) {
        List<Work> works = workRepository.findAll();

        if (req.state() != null && !req.state().trim().isEmpty()) {
            works = works.stream().filter(w -> req.state().equalsIgnoreCase(w.getState())).collect(Collectors.toList());
        }
        if (req.district() != null && !req.district().trim().isEmpty()) {
            works = works.stream().filter(w -> req.district().equalsIgnoreCase(w.getImplementingDistrict())).collect(Collectors.toList());
        }
        if (req.financialYear() != null && !req.financialYear().trim().isEmpty()) {
            works = works.stream().filter(w -> req.financialYear().equalsIgnoreCase(w.getFinancialYear())).collect(Collectors.toList());
        }

        Map<Long, RiskScore> scoreMap = riskScoreRepository.findAll().stream()
                .filter(rs -> rs.getWork() != null)
                .collect(Collectors.toMap(rs -> rs.getWork().getId(), rs -> rs, (a, b) -> a));

        if (req.riskLevel() != null && !req.riskLevel().trim().isEmpty()) {
            works = works.stream().filter(w -> {
                RiskScore rs = scoreMap.get(w.getId());
                return rs != null && req.riskLevel().equalsIgnoreCase(rs.getRiskLevel());
            }).collect(Collectors.toList());
        }

        if ("CSV".equalsIgnoreCase(req.format())) {
            StringBuilder sb = new StringBuilder();
            sb.append("Unique Work Number,Work Name,District,State,MP Name,Agency,Sanction Amount,Actual Expenditure,Status,Risk Level,Risk Score,Priority Score\n");

            for (Work w : works) {
                RiskScore rs = scoreMap.get(w.getId());
                sb.append("\"").append(clean(w.getUniqueWorkNumber())).append("\",")
                  .append("\"").append(clean(w.getWorkName())).append("\",")
                  .append("\"").append(clean(w.getImplementingDistrict())).append("\",")
                  .append("\"").append(clean(w.getState())).append("\",")
                  .append("\"").append(clean(w.getMpName())).append("\",")
                  .append("\"").append(clean(w.getImplementingAgencyName())).append("\",")
                  .append(w.getSanctionAmount() != null ? w.getSanctionAmount() : 0.0).append(",")
                  .append(w.getActualExpenditure() != null ? w.getActualExpenditure() : 0.0).append(",")
                  .append("\"").append(clean(w.getWorkStatus())).append("\",")
                  .append(rs != null ? rs.getRiskLevel() : "LOW").append(",")
                  .append(rs != null ? rs.getRiskScore() : 0).append(",")
                  .append(rs != null ? rs.getPriorityScore() : 0).append("\n");
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=netradhrishti_report.csv")
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(sb.toString());
        }

        // Return JSON report summary
        List<Map<String, Object>> rows = works.stream().map(w -> {
            RiskScore rs = scoreMap.get(w.getId());
            Map<String, Object> map = new HashMap<>();
            map.put("uniqueWorkNumber", w.getUniqueWorkNumber());
            map.put("workName", w.getWorkName());
            map.put("district", w.getImplementingDistrict());
            map.put("state", w.getState());
            map.put("mpName", w.getMpName());
            map.put("agency", w.getImplementingAgencyName());
            map.put("sanctionAmount", w.getSanctionAmount());
            map.put("actualExpenditure", w.getActualExpenditure());
            map.put("status", w.getWorkStatus());
            map.put("riskLevel", rs != null ? rs.getRiskLevel() : "LOW");
            map.put("riskScore", rs != null ? rs.getRiskScore() : 0);
            map.put("priorityScore", rs != null ? rs.getPriorityScore() : 0);
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "totalRecords", rows.size(),
                "reportType", req.reportType() != null ? req.reportType() : "CUSTOM",
                "records", rows
        ));
    }

    private String clean(String val) {
        if (val == null) return "";
        return val.replace("\"", "\"\"");
    }
}
