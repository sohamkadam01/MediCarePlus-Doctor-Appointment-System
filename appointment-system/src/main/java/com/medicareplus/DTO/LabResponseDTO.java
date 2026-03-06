package com.medicareplus.DTO;

import com.medicareplus.Models.LabEnrollmentStatus;  // Import enum
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabResponseDTO {
    private Integer id;
    private String name;
    private String address;
    private String contact;
    private String email;
    private String registrationNumber;
    private String labType;
    private String website;
    private Integer yearEstablished;
    private Boolean homeCollection;
    private Boolean emergencyServices;
    private Integer reportTurnaround;
    private LabEnrollmentStatus status;  // Changed from String to enum
}
