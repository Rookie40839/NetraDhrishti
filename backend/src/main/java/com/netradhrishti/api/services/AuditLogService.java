package com.netradhrishti.api.services;

import com.netradhrishti.api.models.AuditLog;
import com.netradhrishti.api.repositories.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public AuditLog logAction(Long actorUserId, String actionType, String targetType, String targetId, String details, String ipAddress) {
        try {
            AuditLog log = new AuditLog();
            log.setActorUserId(actorUserId);
            log.setActionType(actionType);
            log.setTargetType(targetType);
            log.setTargetId(targetId);
            log.setDetails(details);
            log.setIpAddress(ipAddress);
            log.setTimestamp(LocalDateTime.now());
            return auditLogRepository.save(log);
        } catch (Exception e) {
            // Log failure should not fail parent transaction
            System.err.println("Failed to write audit log: " + e.getMessage());
            return null;
        }
    }
}
