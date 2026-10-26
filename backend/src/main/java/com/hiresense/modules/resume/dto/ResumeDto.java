package com.hiresense.modules.resume.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeDto {
    private Long id;
    private Integer versionNumber;
    private String originalFilename;
    private Long fileSizeBytes;
    private Integer pageCount;
    private boolean active;
    private Instant createdAt;
    private boolean analyzed;
    private Integer latestScore;
}
