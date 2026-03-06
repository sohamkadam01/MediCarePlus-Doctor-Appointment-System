package com.medicareplus.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorMessageThreadDTO {
    private Long id;
    private Integer patientId;
    private String patientName;
    private Long appointmentId;
    private String appointmentDate;
    private String appointmentTime;
    private String appointmentStatus;
    private String lastMessageAt;
    private String lastMessageText;
    private long unreadCount;
}

