package com.medicareplus.Models;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "payment_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false, unique = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Appointment appointment;

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

    @Column(name = "amount", nullable = false)
    private Double amount;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PaymentStatus status = PaymentStatus.PAID;

    @Enumerated(EnumType.STRING)
    @Column(name = "method", nullable = false, length = 30)
    private PaymentMethod method = PaymentMethod.CASH;

    @Column(name = "transaction_reference", length = 100)
    private String transactionReference;

    @Column(name = "appointment_date_snapshot", nullable = false)
    private LocalDate appointmentDateSnapshot;

    @Column(name = "appointment_time_snapshot", nullable = false)
    private LocalTime appointmentTimeSnapshot;

    @Column(name = "doctor_name_snapshot", nullable = false, length = 100)
    private String doctorNameSnapshot;

    @Column(name = "patient_name_snapshot", nullable = false, length = 100)
    private String patientNameSnapshot;

    @Column(name = "visit_type_snapshot", length = 30)
    private String visitTypeSnapshot;

    @Column(name = "paid_at", nullable = false)
    private LocalDateTime paidAt;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (paidAt == null) {
            paidAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
