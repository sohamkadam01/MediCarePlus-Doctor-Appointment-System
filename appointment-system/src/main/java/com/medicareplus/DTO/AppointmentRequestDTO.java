// AppointmentRequestDTO.java
package com.medicareplus.DTO;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;
import com.medicareplus.Models.BookingSource;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentRequestDTO {
    @NotNull(message = "Doctor ID is required")
    private Integer doctorId;

    @NotNull(message = "Appointment date is required")
    @FutureOrPresent(message = "Appointment date cannot be in the past")
    private LocalDate appointmentDate;

    @NotNull(message = "Appointment time is required")
    private LocalTime appointmentTime;

    @NotBlank(message = "Reason is required")
    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;

    @NotBlank(message = "Symptoms are required")
    @Size(max = 1000, message = "Symptoms cannot exceed 1000 characters")
    private String symptoms;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;

    @Size(max = 100, message = "Duration of symptoms cannot exceed 100 characters")
    private String durationOfSymptoms;

    @Size(max = 20, message = "Severity cannot exceed 20 characters")
    private String severity;

    @Size(max = 20, message = "Visit type cannot exceed 20 characters")
    private String visitType;

    private BookingSource bookingSource;

    private Long parentAppointmentId;
    
}
