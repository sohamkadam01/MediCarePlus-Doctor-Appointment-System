package com.medicareplus.Models;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@Table(name = "appointments")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Patient details
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", referencedColumnName = "id", nullable = false)
    @JsonBackReference("patient-appointments")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User patient;
    
    // Doctor details
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", referencedColumnName = "id", nullable = false)
    @JsonBackReference("doctor-appointments")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User doctor;
    
    // Appointment details
    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;
    
    @Column(name = "appointment_time", nullable = false)
    private LocalTime appointmentTime;
    
    @Column(name = "end_time")
    private LocalTime endTime;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AppointmentStatus status = AppointmentStatus.PENDING;
    
    @Column(name = "reason", length = 500)
    private String reason;
    
    @Column(name = "symptoms", length = 1000)
    private String symptoms;
    
    @Column(name = "notes", length = 1000)
    private String notes;
    
    // Payment details
    @Column(name = "consultation_fee")
    private Double consultationFee;
    
    
    // Prescription and medical records
    @Column(name = "prescription", length = 2000)
    private String prescription;
    
    @Column(name = "diagnosis", length = 1000)
    private String diagnosis;
    
    @Column(name = "follow_up_date")
    private LocalDate followUpDate;
    
    // Video consultation link
    @Column(name = "video_link")
    private String videoLink;
    
    @Column(name = "meeting_id")
    private String meetingId;
    
    // Ratings and feedback
    @Column(name = "rating")
    private Integer rating; // 1-5 stars
    
    @Column(name = "feedback", length = 1000)
    private String feedback;
    
    // Timestamps
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
    
    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        
        // Calculate end time (30 minutes after start time)
        if (appointmentTime != null) {
            endTime = appointmentTime.plusMinutes(30);
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        
        // Update end time if appointment time changed
        if (appointmentTime != null) {
            endTime = appointmentTime.plusMinutes(30);
        }
        
        // Set completed timestamp
        if (status == AppointmentStatus.COMPLETED && completedAt == null) {
            completedAt = LocalDateTime.now();
        }
        
        // Set cancelled timestamp
        if (status == AppointmentStatus.CANCELLED && cancelledAt == null) {
            cancelledAt = LocalDateTime.now();
        }
    }
    
    // Helper methods
    public boolean isUpcoming() {
        return appointmentDate.isAfter(LocalDate.now()) ||
               (appointmentDate.isEqual(LocalDate.now()) && 
                appointmentTime.isAfter(LocalTime.now()));
    }
    
    public boolean isPast() {
        return appointmentDate.isBefore(LocalDate.now()) ||
               (appointmentDate.isEqual(LocalDate.now()) && 
                appointmentTime.isBefore(LocalTime.now()));
    }
    
    public boolean canCancel() {
        return status != AppointmentStatus.COMPLETED && 
               status != AppointmentStatus.CANCELLED &&
               isUpcoming();
    }
}
