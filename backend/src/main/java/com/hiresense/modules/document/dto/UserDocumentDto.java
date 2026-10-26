package com.hiresense.modules.document.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDocumentDto {
    private Long id;
    private String title;
    private String documentType;
    private String filePath;
    private Long fileSizeBytes;
    private String mimeType;
    private String externalUrl;
    private String notes;
    private Instant createdAt;
}
