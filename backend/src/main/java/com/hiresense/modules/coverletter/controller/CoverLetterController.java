package com.hiresense.modules.coverletter.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.coverletter.dto.CoverLetterDto;
import com.hiresense.modules.coverletter.dto.CoverLetterGenerateRequest;
import com.hiresense.modules.coverletter.service.CoverLetterService;
import com.hiresense.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cover-letters")
@RequiredArgsConstructor
public class CoverLetterController {

    private final CoverLetterService coverLetterService;
    private final com.hiresense.modules.resume.service.PdfTextExtractorService pdfExtractor;

    // 1. Get All User Cover Letters
    @GetMapping
    public ResponseEntity<ApiResponse<List<CoverLetterDto>>> getMyCoverLetters(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<CoverLetterDto> list = coverLetterService.getMyCoverLetters(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    // 2. Get Single Cover Letter
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CoverLetterDto>> getCoverLetterById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        CoverLetterDto dto = coverLetterService.getCoverLetterById(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    // 3. Generate New AI Cover Letter
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<CoverLetterDto>> generateCoverLetter(
            @RequestBody CoverLetterGenerateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        CoverLetterDto generated = coverLetterService.generateCoverLetter(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Cover letter generated successfully", generated));
    }

    // 4. Update Cover Letter
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CoverLetterDto>> updateCoverLetter(
            @PathVariable Long id,
            @RequestBody CoverLetterDto request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        CoverLetterDto updated = coverLetterService.updateCoverLetter(id, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Cover letter updated successfully", updated));
    }

    // 5. Delete Cover Letter
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCoverLetter(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        coverLetterService.deleteCoverLetter(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Cover letter deleted successfully", null));
    }

    // 6. Extract Text from Uploaded File (PDF, TXT, MD, etc.)
    @PostMapping(value = "/extract-file-text", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> extractFileText(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File is empty or missing"));
        }

        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String extractedText = "";

        if (filename.toLowerCase().endsWith(".pdf")) {
            try {
                extractedText = pdfExtractor.validateAndExtractText(file).getText();
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(ApiResponse.error("PDF Extraction failed: " + e.getMessage()));
            }
        } else {
            try {
                extractedText = new String(file.getBytes(), java.nio.charset.StandardCharsets.UTF_8).trim();
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Failed to read text file: " + e.getMessage()));
            }
        }

        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("filename", filename);
        data.put("sizeBytes", file.getSize());
        data.put("text", extractedText);
        return ResponseEntity.ok(ApiResponse.success("Text extracted successfully", data));
    }
}
