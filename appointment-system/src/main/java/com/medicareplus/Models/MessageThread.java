package com.medicareplus.Models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "message_threads",
        uniqueConstraints = @UniqueConstraint(name = "uk_message_thread_doctor_patient", columnNames = {"doctor_id", "patient_id"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageThread {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_appointment_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Appointment lastAppointment;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

