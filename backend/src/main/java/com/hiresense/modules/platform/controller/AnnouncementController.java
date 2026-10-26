package com.hiresense.modules.platform.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.platform.dto.AnnouncementDto;
import com.hiresense.modules.platform.dto.CreateAnnouncementRequest;
import com.hiresense.modules.platform.service.AnnouncementService;
import com.hiresense.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    // 1. Get Active Broadcast Announcements (Students filtered by registration time)
    @GetMapping
    public ResponseEntity<ApiResponse<List<AnnouncementDto>>> getActiveAnnouncements(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : null;
        List<AnnouncementDto> list = announcementService.getActiveAnnouncementsForUser(userId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    // 2. Get All Announcements (Admin / Placement Officer)
    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLACEMENT_OFFICER')")
    public ResponseEntity<ApiResponse<List<AnnouncementDto>>> getAllAnnouncements() {
        List<AnnouncementDto> list = announcementService.getAllAnnouncements();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    // 3. Create Announcement (Admin / Placement Officer)
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PLACEMENT_OFFICER')")
    public ResponseEntity<ApiResponse<AnnouncementDto>> createAnnouncement(
            @Valid @RequestBody CreateAnnouncementRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AnnouncementDto dto = announcementService.createAnnouncement(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Announcement broadcasted successfully", dto));
    }

    // 4. Deactivate Announcement (Admin / Placement Officer)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLACEMENT_OFFICER')")
    public ResponseEntity<ApiResponse<Void>> deactivateAnnouncement(@PathVariable Long id) {
        announcementService.deactivateAnnouncement(id);
        return ResponseEntity.ok(ApiResponse.success("Announcement deactivated successfully", null));
    }
}
