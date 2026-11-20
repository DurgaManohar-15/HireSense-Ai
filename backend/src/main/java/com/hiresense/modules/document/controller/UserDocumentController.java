package com.hiresense.modules.document.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.document.dto.UserDocumentDto;
import com.hiresense.modules.document.model.UserDocument;
import com.hiresense.modules.document.service.UserDocumentService;
import com.hiresense.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class UserDocumentController {

    private final UserDocumentService documentService;

    // 1. List All User Documents
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDocumentDto>>> getMyDocuments(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<UserDocumentDto> list = documentService.getMyDocuments(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    // 2. Add New Document via Link
    @PostMapping
    public ResponseEntity<ApiResponse<UserDocumentDto>> createDocument(
            @RequestBody UserDocumentDto request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserDocumentDto created = documentService.createDocument(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Document added successfully", created));
    }

    // 3. Upload Document File (PDF, DOCX, Images, etc.)
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserDocumentDto>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "documentType", required = false, defaultValue = "CERTIFICATE") String documentType,
            @RequestParam(value = "notes", required = false) String notes,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserDocumentDto created = documentService.uploadDocumentFile(
                userPrincipal.getId(), file, title, documentType, notes);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Document file uploaded successfully", created));
    }

    // 4. Download / View Document File
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserDocument doc = documentService.getDocumentEntity(id, userPrincipal.getId());
        Resource resource = documentService.loadDocumentFile(id, userPrincipal.getId());

        String mimeType = doc.getMimeType() != null ? doc.getMimeType() : "application/octet-stream";
        String filename = (doc.getTitle() != null ? doc.getTitle() : "document")
                .replaceAll("[^a-zA-Z0-9.-]", "_");
        if (!filename.contains(".")) {
            String ext = doc.getFilePath() != null && doc.getFilePath().contains(".")
                    ? doc.getFilePath().substring(doc.getFilePath().lastIndexOf("."))
                    : ".pdf";
            filename += ext;
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mimeType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }

    // 5. Delete Document
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        documentService.deleteDocument(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Document removed successfully", null));
    }
}
