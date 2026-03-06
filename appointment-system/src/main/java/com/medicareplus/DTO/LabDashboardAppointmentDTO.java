package com.medicareplus.DTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LabDashboardAppointmentDTO {
    private Long id;
    private String patientName;
    private String mrn;
    private String testName;
    private String scheduledTime;
    private String doctorName;
    private String priority;
    private String status;
}
