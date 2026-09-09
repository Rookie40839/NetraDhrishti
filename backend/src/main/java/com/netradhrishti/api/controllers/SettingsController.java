package com.netradhrishti.api.controllers;

import com.netradhrishti.api.models.RiskWeight;
import com.netradhrishti.api.repositories.RiskWeightRepository;
import com.netradhrishti.api.services.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class SettingsController {

    @Autowired
    private RiskWeightRepository riskWeightRepository;

    @Autowired
    private AuditLogService auditLogService;

    public record UpdateWeightsRequest(
            Double costW,
            Double delayW,
            Double fundW,
            Double duplicateW,
            Double complianceW,
            Long updatedBy
    ) {}

    @GetMapping("/risk-weights")
    public ResponseEntity<RiskWeight> getRiskWeights() {
        RiskWeight weight = riskWeightRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> {
                    RiskWeight rw = new RiskWeight();
                    rw.setCostW(0.30);
                    rw.setDelayW(0.25);
                    rw.setFundW(0.20);
                    rw.setDuplicateW(0.15);
                    rw.setComplianceW(0.10);
                    return riskWeightRepository.save(rw);
                });
        return ResponseEntity.ok(weight);
    }

    @PutMapping("/risk-weights")
    public ResponseEntity<?> updateRiskWeights(
            @RequestBody UpdateWeightsRequest req,
            HttpServletRequest servletRequest
    ) {
        // Validate sum ~ 1.0
        double sum = (req.costW() != null ? req.costW() : 0.0)
                + (req.delayW() != null ? req.delayW() : 0.0)
                + (req.fundW() != null ? req.fundW() : 0.0)
                + (req.duplicateW() != null ? req.duplicateW() : 0.0)
                + (req.complianceW() != null ? req.complianceW() : 0.0);

        if (Math.abs(sum - 1.0) > 0.05) {
            return ResponseEntity.badRequest().body(Map.of("message", "Weights must sum to approximately 1.0 (currently " + String.format("%.2f", sum) + ")"));
        }

        RiskWeight weight = riskWeightRepository.findFirstByOrderByIdAsc()
                .orElseGet(RiskWeight::new);

        if (req.costW() != null) weight.setCostW(req.costW());
        if (req.delayW() != null) weight.setDelayW(req.delayW());
        if (req.fundW() != null) weight.setFundW(req.fundW());
        if (req.duplicateW() != null) weight.setDuplicateW(req.duplicateW());
        if (req.complianceW() != null) weight.setComplianceW(req.complianceW());
        weight.setUpdatedBy(req.updatedBy());
        weight.setUpdatedAt(LocalDateTime.now());

        RiskWeight saved = riskWeightRepository.save(weight);

        auditLogService.logAction(
                req.updatedBy(),
                "UPDATE_RISK_WEIGHTS",
                "RISK_WEIGHTS",
                saved.getId().toString(),
                "{\"cost\":" + saved.getCostW() + ",\"delay\":" + saved.getDelayW() + ",\"fund\":" + saved.getFundW() + ",\"duplicate\":" + saved.getDuplicateW() + ",\"compliance\":" + saved.getComplianceW() + "}",
                servletRequest.getRemoteAddr()
        );

        return ResponseEntity.ok(saved);
    }
}
