package com.medicareplus.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientMessageThreadDTO {
    private Long id;
    private Integer doctorId;
    private String doctorName;
    private Long appointmentId;
    private String appointmentDate;
    private String appointmentTime;
    private String appointmentStatus;
    private String lastMessageAt;
    private String lastMessageText;
    private long unreadCount;
}

