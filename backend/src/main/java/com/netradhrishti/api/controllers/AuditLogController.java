package com.netradhrishti.api.controllers;

import com.netradhrishti.api.models.AuditLog;
import com.netradhrishti.api.repositories.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit-log")
@CrossOrigin(origins = "*")
public class AuditLogController {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<Page<AuditLog>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size
    ) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc(pageable));
    }
}
