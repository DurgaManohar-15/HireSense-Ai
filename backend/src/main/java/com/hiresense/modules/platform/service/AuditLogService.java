package com.hiresense.modules.platform.service;

import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.platform.dto.AuditLogDto;
import com.hiresense.modules.platform.model.AdminAuditLog;
import com.hiresense.modules.platform.repository.AdminAuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AdminAuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public void logAction(Long adminUserId, String actionType, String entityName, String entityId, String details, String ipAddress) {
        try {
            User admin = userRepository.findById(adminUserId).orElse(null);
            if (admin == null) return;

            AdminAuditLog logEntry = AdminAuditLog.builder()
                    .adminUser(admin)
                    .actionType(actionType)
                    .entityName(entityName)
                    .entityId(entityId)
                    .details(details)
                    .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                    .createdAt(Instant.now())
                    .build();

            auditLogRepository.save(logEntry);
        } catch (Exception e) {
            log.error("Failed to write admin audit log: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<AuditLogDto> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable).map(l -> AuditLogDto.builder()
                .id(l.getId())
                .adminEmail(l.getAdminUser() != null ? l.getAdminUser().getEmail() : "SYSTEM")
                .actionType(l.getActionType())
                .entityName(l.getEntityName())
                .entityId(l.getEntityId())
                .details(l.getDetails())
                .ipAddress(l.getIpAddress())
                .createdAt(l.getCreatedAt())
                .build());
    }
}
