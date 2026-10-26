package com.hiresense.modules.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDto {
    private Long id;
    private String adminEmail;
    private String actionType;
    private String entityName;
    private String entityId;
    private String details;
    private String ipAddress;
    private Instant createdAt;
}
