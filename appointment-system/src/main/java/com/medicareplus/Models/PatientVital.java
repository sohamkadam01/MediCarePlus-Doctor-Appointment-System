package com.medicareplus.Models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "patient_vitals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientVital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User patient;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @Column(name = "systolic_bp")
    private Integer systolicBp;

    @Column(name = "diastolic_bp")
    private Integer diastolicBp;

    @Column(name = "heart_rate")
    private Integer heartRate;

    @Column(name = "spo2")
    private Integer spo2;

    @Column(name = "temperature")
    private Double temperature;

    @Column(name = "weight")
    private Double weight;

    @Column(name = "blood_sugar")
    private Double bloodSugar;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (recordedAt == null) {
            recordedAt = now;
        }
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

