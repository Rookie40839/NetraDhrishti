package com.netradhrishti.api.controllers;

import com.netradhrishti.api.models.Inspection;
import com.netradhrishti.api.models.RiskScore;
import com.netradhrishti.api.models.Work;
import com.netradhrishti.api.repositories.InspectionRepository;
import com.netradhrishti.api.repositories.RiskScoreRepository;
import com.netradhrishti.api.repositories.WorkRepository;
import com.netradhrishti.api.services.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inspections")
@CrossOrigin(origins = "*")
public class InspectionController {

    @Autowired
    private InspectionRepository inspectionRepository;

    @Autowired
    private WorkRepository workRepository;

    @Autowired
    private RiskScoreRepository riskScoreRepository;

    @Autowired
    private AuditLogService auditLogService;

    public record CreateInspectionRequest(
            Long workId,
            Long assignedTo,
            String remarks
    ) {}

    public record UpdateInspectionRequest(
            String status,
            String reviewDecision,
            String findings,
            String remarks,
            String evidenceReferences,
            Long escalatedTo
    ) {}

    @GetMapping("/priority")
    public ResponseEntity<List<Map<String, Object>>> getPriorityQueue(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String riskLevel,
            @RequestParam(required = false) String district
    ) {
        List<RiskScore> topScores = riskScoreRepository.findAll().stream()
                .sorted((a, b) -> Integer.compare(
                        b.getPriorityScore() != null ? b.getPriorityScore() : 0,
                        a.getPriorityScore() != null ? a.getPriorityScore() : 0
                ))
                .collect(Collectors.toList());

        List<Map<String, Object>> queue = new ArrayList<>();
        int rank = 1;

        for (RiskScore rs : topScores) {
            Work work = rs.getWork();
            if (work == null) continue;

            if (district != null && !district.trim().isEmpty() && !district.equalsIgnoreCase(work.getImplementingDistrict())) {
                continue;
            }
            if (riskLevel != null && !riskLevel.trim().isEmpty() && !riskLevel.equalsIgnoreCase(rs.getRiskLevel())) {
                continue;
            }

            var latestInsp = inspectionRepository.findFirstByWorkIdOrderByCreatedAtDesc(work.getId()).orElse(null);

            if (status != null && !status.trim().isEmpty()) {
                String currentStatus = latestInsp != null ? latestInsp.getStatus() : "Unassigned";
                if (!status.equalsIgnoreCase(currentStatus)) {
                    continue;
                }
            }

            Map<String, Object> item = new HashMap<>();
            item.put("priorityRank", rank++);
            item.put("workId", work.getId());
            item.put("uniqueWorkNumber", work.getUniqueWorkNumber());
            item.put("workName", work.getWorkName());
            item.put("district", work.getImplementingDistrict());
            item.put("mpName", work.getMpName());
            item.put("agency", work.getImplementingAgencyName());
            item.put("category", work.getWorkCategory());
            item.put("sanctionAmount", work.getSanctionAmount());
            item.put("riskScore", rs.getRiskScore());
            item.put("impactScore", rs.getImpactScore());
            item.put("priorityScore", rs.getPriorityScore());
            item.put("riskLevel", rs.getRiskLevel());
            item.put("inspection", latestInsp);
            queue.add(item);
        }

        return ResponseEntity.ok(queue);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInspection(@PathVariable Long id) {
        var inspection = inspectionRepository.findById(id);
        return inspection.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createInspection(@RequestBody CreateInspectionRequest req, HttpServletRequest servletRequest) {
        if (req.workId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "workId is required"));
        }

        var workOpt = workRepository.findById(req.workId());
        if (workOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Work not found with id: " + req.workId()));
        }

        Inspection insp = new Inspection();
        insp.setWork(workOpt.get());
        insp.setAssignedTo(req.assignedTo());
        insp.setStatus("Pending");
        insp.setRemarks(req.remarks());
        insp.setCreatedAt(LocalDateTime.now());
        insp.setUpdatedAt(LocalDateTime.now());

        Inspection saved = inspectionRepository.save(insp);

        auditLogService.logAction(
                req.assignedTo(),
                "CREATE_INSPECTION",
                "INSPECTION",
                saved.getInspectionId().toString(),
                "{\"workId\":" + req.workId() + "}",
                servletRequest.getRemoteAddr()
        );

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInspection(
            @PathVariable Long id,
            @RequestBody UpdateInspectionRequest req,
            HttpServletRequest servletRequest
    ) {
        var opt = inspectionRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Inspection insp = opt.get();
        if (req.status() != null) insp.setStatus(req.status());
        if (req.reviewDecision() != null) insp.setReviewDecision(req.reviewDecision());
        if (req.findings() != null) insp.setFindings(req.findings());
        if (req.remarks() != null) insp.setRemarks(req.remarks());
        if (req.evidenceReferences() != null) insp.setEvidenceReferences(req.evidenceReferences());
        if (req.escalatedTo() != null) insp.setEscalatedTo(req.escalatedTo());
        if ("Completed".equalsIgnoreCase(req.status())) {
            insp.setCompletedAt(LocalDateTime.now());
        }
        insp.setUpdatedAt(LocalDateTime.now());

        Inspection saved = inspectionRepository.save(insp);

        auditLogService.logAction(
                insp.getAssignedTo(),
                "UPDATE_INSPECTION",
                "INSPECTION",
                id.toString(),
                "{\"status\":\"" + req.status() + "\",\"decision\":\"" + req.reviewDecision() + "\"}",
                servletRequest.getRemoteAddr()
        );

        return ResponseEntity.ok(saved);
    }
}
