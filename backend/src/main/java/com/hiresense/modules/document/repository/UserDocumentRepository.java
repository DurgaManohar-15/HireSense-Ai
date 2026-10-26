package com.hiresense.modules.document.repository;

import com.hiresense.modules.document.model.UserDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDocumentRepository extends JpaRepository<UserDocument, Long> {
    List<UserDocument> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<UserDocument> findByIdAndUserId(Long id, Long userId);
}
