package com.medicareplus.Models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "message_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "thread_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private MessageThread thread;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_user_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User senderUser;

    @Enumerated(EnumType.STRING)
    @Column(name = "sender_role", nullable = false, length = 20)
    private MessageSenderRole senderRole;

    @Column(name = "message_text", nullable = false, length = 2000)
    private String messageText;

    @Column(name = "is_read", nullable = false)
    private boolean read;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}

