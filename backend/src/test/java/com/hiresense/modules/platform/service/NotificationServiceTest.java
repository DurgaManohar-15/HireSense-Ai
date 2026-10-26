package com.hiresense.modules.platform.service;

import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.platform.dto.NotificationDto;
import com.hiresense.modules.platform.model.Notification;
import com.hiresense.modules.platform.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("student@hiresense.ai").build();
    }

    @Test
    @DisplayName("Should create and mark notification as read")
    void testNotificationCreationAndRead() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(inv -> {
                    Notification n = inv.getArgument(0);
                    n.setId(10L);
                    return n;
                });

        NotificationDto dto = notificationService.createNotification(1L, "Test Title", "Test Message", "ROADMAP", "/roadmap");

        assertNotNull(dto);
        assertEquals("Test Title", dto.getTitle());
        assertFalse(dto.isRead());

        Notification mockNotif = Notification.builder().id(10L).user(user).read(false).build();
        when(notificationRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(mockNotif));

        NotificationDto readDto = notificationService.markAsRead(10L, 1L);
        assertTrue(readDto.isRead());
    }
}
