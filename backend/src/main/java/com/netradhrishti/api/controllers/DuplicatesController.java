package com.netradhrishti.api.controllers;

import com.netradhrishti.api.models.DuplicateCandidate;
import com.netradhrishti.api.repositories.DuplicateCandidateRepository;
import com.netradhrishti.api.services.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/duplicates")
@CrossOrigin(origins = "*")
public class DuplicatesController {

    @Autowired
    private DuplicateCandidateRepository duplicateCandidateRepository;

    @Autowired
    private AuditLogService auditLogService;

    public record UpdateDuplicateStatusRequest(
            String status,
            Long reviewedBy
    ) {}

    @GetMapping
    public ResponseEntity<List<DuplicateCandidate>> getAllDuplicates(@RequestParam(required = false) String status) {
        if (status != null && !status.trim().isEmpty()) {
            return ResponseEntity.ok(duplicateCandidateRepository.findByStatus(status.trim().toUpperCase()));
        }
        return ResponseEntity.ok(duplicateCandidateRepository.findAll());
    }

    @GetMapping("/{workId}")
    public ResponseEntity<List<DuplicateCandidate>> getDuplicatesForWork(@PathVariable Long workId) {
        return ResponseEntity.ok(duplicateCandidateRepository.findByWorkIdOrderByOverallSimilarityDesc(workId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDuplicateStatus(
            @PathVariable Long id,
            @RequestBody UpdateDuplicateStatusRequest req,
            HttpServletRequest servletRequest
    ) {
        var opt = duplicateCandidateRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        DuplicateCandidate candidate = opt.get();
        if (req.status() != null) {
            candidate.setStatus(req.status().trim().toUpperCase());
        }
        candidate.setReviewedBy(req.reviewedBy());
        candidate.setReviewedAt(LocalDateTime.now());

        DuplicateCandidate saved = duplicateCandidateRepository.save(candidate);

        auditLogService.logAction(
                req.reviewedBy(),
                "UPDATE_DUPLICATE_STATUS",
                "DUPLICATE_CANDIDATE",
                id.toString(),
                "{\"status\":\"" + candidate.getStatus() + "\"}",
                servletRequest.getRemoteAddr()
        );

        return ResponseEntity.ok(saved);
    }
}
