package com.medicareplus.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class LabEnrollmentRequestDTO {
    @NotBlank(message = "Lab name is required")
    private String labName;

    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    private Integer yearEstablished;
    private String labType;
    private String website;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone is required")
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

    private MultipartFile licenseDoc;
    private List<MultipartFile> accreditationDocs;
    private MultipartFile logo;

    private String contactPersonName;
    private String contactPersonDesignation;
    private String contactPersonEmail;
    private String contactPersonPhone;
}
