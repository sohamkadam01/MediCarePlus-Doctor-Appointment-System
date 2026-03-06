package com.medicareplus.DTO;

import java.time.LocalDate;
import java.time.LocalTime;

import com.medicareplus.Models.LabAppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabPatientAppointmentDTO {
    private Long id;
    private String appointmentType;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private LabAppointmentStatus status;

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
    private String referralType;

    private Integer patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;

    private String bookingSource;
}
