package com.medicareplus.DTO;

import com.medicareplus.Models.LabEnrollmentStatus;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LabEnrollmentResponseDTO {
    private Integer id;
    private String labName;
    private String registrationNumber;
    private Integer yearEstablished;
    private String labType;
    private String website;
    private String email;
    private String phone;
    private String alternatePhone;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private boolean nablAccredited;
    private boolean isoCertified;
    private boolean capAccredited;
    private String otherAccreditations;
    private List<String> testCategories;
    private boolean homeCollection;
    private boolean emergencyServices;
    private Integer reportTurnaround;
    private String licenseDocPath;
    private List<String> accreditationDocPaths;
    private String logoPath;
    private String contactPersonName;
    private String contactPersonDesignation;
    private String contactPersonEmail;
    private String contactPersonPhone;
    private LabEnrollmentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
