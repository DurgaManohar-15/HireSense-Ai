package com.hiresense.modules.document.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.document.dto.UserDocumentDto;
import com.hiresense.modules.document.service.UserDocumentService;
import com.hiresense.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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

    // 2. Add New Document / Portfolio link
    @PostMapping
    public ResponseEntity<ApiResponse<UserDocumentDto>> createDocument(
            @RequestBody UserDocumentDto request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserDocumentDto created = documentService.createDocument(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Document added successfully", created));
    }

    // 3. Delete Document
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        documentService.deleteDocument(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Document removed successfully", null));
    }
}
