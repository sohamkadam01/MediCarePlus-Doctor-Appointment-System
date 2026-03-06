package com.medicareplus.Models;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "admin_activity_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "activity_type", nullable = false, length = 60)
    private String activityType;

    @Column(name = "description", nullable = false, length = 500)
    private String description;

    @Column(name = "actor_role", length = 30)
    private String actorRole;

    @Column(name = "actor_id")
    private Integer actorId;

    @Column(name = "actor_name", length = 120)
    private String actorName;

    @Column(name = "target_type", length = 60)
    private String targetType;

    @Column(name = "target_id")
    private Long targetId;

    @Column(name = "is_unread", nullable = false)
    private boolean unread = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
