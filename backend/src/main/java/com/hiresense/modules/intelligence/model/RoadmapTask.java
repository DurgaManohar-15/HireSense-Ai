package com.hiresense.modules.intelligence.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "roadmap_tasks")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roadmap_id", nullable = false)
    private Roadmap roadmap;

    @Column(name = "day_number", nullable = false)
    private Integer dayNumber;

    @Column(nullable = false, length = 150)
    private String topic;

    @Column(name = "skill_name", nullable = false, length = 100)
    private String skillName;

    @Column(name = "activity_type", nullable = false, length = 50)
    private String activityType; // 'LEARN', 'PRACTICE', 'QUIZ', 'CODING', 'MOCK_INTERVIEW', 'RESUME_POLISH'

    @Column(name = "estimated_duration_minutes", nullable = false)
    @Builder.Default
    private Integer estimatedDurationMinutes = 60;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String priority = "HIGH"; // 'HIGH', 'MEDIUM', 'LOW'

    @Column(name = "learning_objective", nullable = false, columnDefinition = "TEXT")
    private String learningObjective;

    @Column(name = "resources_json", columnDefinition = "TEXT")
    private String resourcesJson;

    @Column(name = "is_completed", nullable = false)
    @Builder.Default
    private boolean completed = false;

    @Column(name = "is_skipped", nullable = false)
    @Builder.Default
    private boolean skipped = false;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
