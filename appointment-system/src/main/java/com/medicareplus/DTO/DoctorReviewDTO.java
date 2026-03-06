package com.medicareplus.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorReviewDTO {
    private Long appointmentId;
    private Integer patientId;
    private String patientName;
    private Integer doctorId;
    private String doctorName;
    private Integer rating;
    private String feedback;
    private LocalDate appointmentDate;
    private LocalDateTime reviewedAt;
}
