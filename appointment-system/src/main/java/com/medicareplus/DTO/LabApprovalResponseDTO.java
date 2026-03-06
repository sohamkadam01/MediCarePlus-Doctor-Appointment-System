package com.medicareplus.DTO;

import com.medicareplus.Models.Lab;
import com.medicareplus.Models.LabEnrollmentStatus;  // Import enum
import com.medicareplus.Models.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LabApprovalResponseDTO {
    private Integer id;
    private String name;
    private String email;
    private String phone;
    private UserStatus userStatus;  // Renamed for clarity
    private Lab labDetails;
    private LabEnrollmentStatus labStatus;  // Add this
}