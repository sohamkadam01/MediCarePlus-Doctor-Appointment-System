package com.medicareplus.Models;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "lab_enrollments")
@Data
@NoArgsConstructor
public class LabEnrollmentApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    @Lob
    private String testCategories;

    private boolean homeCollection;
    private boolean emergencyServices;
    private Integer reportTurnaround;

    private String licenseDocPath;
    @Lob
    private String accreditationDocPaths;
    private String logoPath;

    private String contactPersonName;
    private String contactPersonDesignation;
    private String contactPersonEmail;
    private String contactPersonPhone;

    @Enumerated(EnumType.STRING)
    private LabEnrollmentStatus status = LabEnrollmentStatus.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}
