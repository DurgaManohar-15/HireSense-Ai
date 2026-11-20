package com.hiresense.modules.document.service;

import com.hiresense.common.exception.BadRequestException;
import com.hiresense.common.exception.ResourceNotFoundException;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.document.dto.UserDocumentDto;
import com.hiresense.modules.document.model.UserDocument;
import com.hiresense.modules.document.repository.UserDocumentRepository;
import com.hiresense.modules.resume.storage.ResumeStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDocumentService {

    private final UserDocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final ResumeStorageService storageService;

    @Transactional(readOnly = true)
    public List<UserDocumentDto> getMyDocuments(Long userId) {
        return documentRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public UserDocumentDto createDocument(Long userId, UserDocumentDto dto) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserDocument doc = UserDocument.builder()
            .user(user)
            .title(dto.getTitle() != null ? dto.getTitle().trim() : "Untitled Document")
            .documentType(dto.getDocumentType() != null ? dto.getDocumentType() : "CERTIFICATE")
            .filePath(dto.getFilePath())
            .fileSizeBytes(dto.getFileSizeBytes() != null ? dto.getFileSizeBytes() : 102400L)
            .mimeType(dto.getMimeType() != null ? dto.getMimeType() : "application/pdf")
            .externalUrl(dto.getExternalUrl())
            .notes(dto.getNotes())
            .build();

        return toDto(documentRepository.save(doc));
    }

    @Transactional
    public UserDocumentDto uploadDocumentFile(Long userId, MultipartFile file, String title, String documentType, String notes) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file cannot be empty");
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf";
        String extension = originalFilename.contains(".") ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".pdf";
        String storageFilename = "doc_" + UUID.randomUUID().toString().replace("-", "") + extension;

        try {
            storageService.store(file.getInputStream(), storageFilename);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store uploaded document file: " + e.getMessage(), e);
        }

        String docTitle = (title != null && !title.isBlank()) ? title.trim() : originalFilename;
        String docType = (documentType != null && !documentType.isBlank()) ? documentType : "CERTIFICATE";
        String contentType = file.getContentType() != null ? file.getContentType() : "application/pdf";

        UserDocument doc = UserDocument.builder()
            .user(user)
            .title(docTitle)
            .documentType(docType)
            .filePath(storageFilename)
            .fileSizeBytes(file.getSize())
            .mimeType(contentType)
            .externalUrl(null)
            .notes(notes)
            .build();

        return toDto(documentRepository.save(doc));
    }

    @Transactional(readOnly = true)
    public Resource loadDocumentFile(Long id, Long userId) {
        UserDocument doc = documentRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        if (doc.getFilePath() == null || doc.getFilePath().isBlank()) {
            throw new BadRequestException("This document does not have an attached file");
        }

        return storageService.loadAsResource(doc.getFilePath());
    }

    @Transactional(readOnly = true)
    public UserDocument getDocumentEntity(Long id, Long userId) {
        return documentRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
    }

    @Transactional
    public void deleteDocument(Long id, Long userId) {
        UserDocument doc = documentRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new IllegalArgumentException("Document not found"));
        
        // Clean up stored file if exists
        if (doc.getFilePath() != null && !doc.getFilePath().isBlank()) {
            try {
                storageService.delete(doc.getFilePath());
            } catch (Exception ignored) {}
        }

        documentRepository.delete(doc);
    }

    private UserDocumentDto toDto(UserDocument doc) {
        return UserDocumentDto.builder()
            .id(doc.getId())
            .title(doc.getTitle())
            .documentType(doc.getDocumentType())
            .filePath(doc.getFilePath())
            .fileSizeBytes(doc.getFileSizeBytes())
            .mimeType(doc.getMimeType())
            .externalUrl(doc.getExternalUrl())
            .notes(doc.getNotes())
            .createdAt(doc.getCreatedAt())
            .build();
    }
}
