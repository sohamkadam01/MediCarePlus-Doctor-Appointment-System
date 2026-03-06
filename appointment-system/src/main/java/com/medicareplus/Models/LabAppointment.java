package com.medicareplus.Models;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "lab_appointments")
public class LabAppointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer labId;
    private String labName;
    private String labEmail;
    private String labPhone;
    private String labAddress;
    private String labCity;
    private String labState;
    private String labPincode;

    private String testName;
    private Double testPrice;
    private String preparation;
    private Integer turnaroundHours;
    private String referralType;

    private Integer patientId;
    private String patientName;
    private String patientPhone;
    private String patientEmail;
    private Integer patientAge;
    private String patientGender;

    private String bookingSource;

    @Enumerated(EnumType.STRING)
    private LabAppointmentStatus status;

    private String priority;

    private LocalDate appointmentDate;
    private LocalTime appointmentTime;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
