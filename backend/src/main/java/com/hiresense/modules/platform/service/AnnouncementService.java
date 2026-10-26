package com.hiresense.modules.platform.service;

import com.hiresense.common.exception.ResourceNotFoundException;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.platform.dto.AnnouncementDto;
import com.hiresense.modules.platform.dto.CreateAnnouncementRequest;
import com.hiresense.modules.platform.model.Announcement;
import com.hiresense.modules.platform.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public AnnouncementDto createAnnouncement(Long adminUserId, CreateAnnouncementRequest request) {
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found: " + adminUserId));

        Instant now = Instant.now();
        Announcement announcement = Announcement.builder()
                .createdBy(admin)
                .title(request.getTitle())
                .content(request.getContent())
                .targetAudience(request.getTargetAudience() != null ? request.getTargetAudience() : "ALL_STUDENTS")
                .priority(request.getPriority() != null ? request.getPriority() : "NORMAL")
                .active(true)
                .createdAt(now)
                .build();

        Announcement saved = announcementRepository.save(announcement);

        // Notify all existing students registered up to this moment
        try {
            List<User> existingStudents = userRepository.findAll().stream()
                    .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().name().equals("ROLE_STUDENT"))
                            && (u.getCreatedAt() == null || !u.getCreatedAt().isAfter(saved.getCreatedAt())))
                    .collect(Collectors.toList());

            for (User student : existingStudents) {
                try {
                    notificationService.createNotification(
                            student.getId(),
                            "📢 Campus Alert: " + saved.getTitle(),
                            saved.getContent(),
                            "ANNOUNCEMENT",
                            "/announcements"
                    );
                } catch (Exception e) {
                    log.warn("Failed to create notification for student ID {}: {}", student.getId(), e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Failed to broadcast notifications to existing students: {}", e.getMessage());
        }

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AnnouncementDto> getActiveAnnouncements() {
        return announcementRepository.findByActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AnnouncementDto> getActiveAnnouncementsForUser(Long userId) {
        if (userId == null) {
            return getActiveAnnouncements();
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return getActiveAnnouncements();
        }

        // Admins and placement officers see all announcements
        boolean isStaff = user.getRoles().stream().anyMatch(r -> 
            r.getName().name().equals("ROLE_ADMIN") || r.getName().name().equals("ROLE_PLACEMENT_OFFICER")
        );
        if (isStaff) {
            return getActiveAnnouncements();
        }

        // Students only see announcements created at or after their registration time (with 1-min clock grace period)
        Instant studentJoinedAt = user.getCreatedAt();
        if (studentJoinedAt == null) {
            return getActiveAnnouncements();
        }

        Instant cutoff = studentJoinedAt.minus(Duration.ofMinutes(1));
        return announcementRepository.findByActiveTrueAndCreatedAtGreaterThanEqualOrderByCreatedAtDesc(cutoff).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AnnouncementDto> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deactivateAnnouncement(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found: " + id));
        announcement.setActive(false);
        announcementRepository.save(announcement);
    }

    private AnnouncementDto mapToDto(Announcement a) {
        String author = (a.getCreatedBy() != null)
                ? a.getCreatedBy().getFirstName() + " " + a.getCreatedBy().getLastName()
                : "System Administrator";

        return AnnouncementDto.builder()
                .id(a.getId())
                .title(a.getTitle())
                .content(a.getContent())
                .targetAudience(a.getTargetAudience())
                .priority(a.getPriority())
                .authorName(author)
                .active(a.isActive())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
