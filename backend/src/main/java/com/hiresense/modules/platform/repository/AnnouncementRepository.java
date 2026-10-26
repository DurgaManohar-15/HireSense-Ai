package com.hiresense.modules.platform.repository;

import com.hiresense.modules.platform.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByActiveTrueOrderByCreatedAtDesc();
    List<Announcement> findByActiveTrueAndCreatedAtGreaterThanEqualOrderByCreatedAtDesc(java.time.Instant timestamp);
    List<Announcement> findAllByOrderByCreatedAtDesc();
}
