// AppointmentResponseDTO.java
package com.medicareplus.DTO;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.medicareplus.Models.AppointmentStatus;
import com.medicareplus.Models.BookingSource;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponseDTO {
    private Long id;
    private Integer patientId;
    private String patientName;
    private Integer doctorId;
    private String doctorName;
    private String specialization;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private LocalTime endTime;
    private AppointmentStatus status;
    private String clinicAddress;
    private String reason;
    private String symptoms;
    private String notes;
    private String durationOfSymptoms;
    private String severity;
    private String visitType;
    private BookingSource bookingSource;
    private Long parentAppointmentId;
    private String patientSnapshotName;
    private Integer patientSnapshotAge;
    private String patientSnapshotGender;
    private String patientSnapshotBloodGroup;
    private String patientSnapshotAllergies;
    private String patientEmergencyContactName;
    private String patientEmergencyContactPhone;
    private Double consultationFee;
    private String prescription;
    private String diagnosis;
    private LocalDate followUpDate;
    private String videoLink;
    private String meetingId;
    private Integer rating;
    private String feedback;
    private LocalDateTime createdAt;
    private String cancellationReason;
}

