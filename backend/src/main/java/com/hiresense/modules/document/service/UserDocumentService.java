package com.hiresense.modules.document.service;

import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.document.dto.UserDocumentDto;
import com.hiresense.modules.document.model.UserDocument;
import com.hiresense.modules.document.repository.UserDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDocumentService {

    private final UserDocumentRepository documentRepository;
    private final UserRepository userRepository;

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
    public void deleteDocument(Long id, Long userId) {
        UserDocument doc = documentRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new IllegalArgumentException("Document not found"));
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
