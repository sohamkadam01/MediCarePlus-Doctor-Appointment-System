package com.medicareplus.Models;

import java.time.LocalDate;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@Table(name = "patient_details")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true, nullable = false)
    @JsonBackReference("user-patient")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;  // This links to User table
    
    @Column(name = "date_of_birth")
    private LocalDate  dateOfBirth;
    
    @Column(name = "age")
    private Integer age;
    
    @Column(name = "gender", length = 10)
    private String gender;
    
    @Column(name = "blood_group", length = 5)
    private String bloodGroup;
    
    @Column(name = "address", length = 500)
    private String address;
    
    @Column(name = "city", length = 50)
    private String city;
    
    @Column(name = "state", length = 50)
    private String state;
    
    @Column(name = "country", length = 50)
    private String country;
    
    @Column(name = "pincode", length = 10)
    private String pincode;
    
    @Column(name = "emergency_contact_name", length = 100)
    private String emergencyContactName;
    
    @Column(name = "emergency_contact_phone", length = 15)
    private String emergencyContactPhone;
    
    @Column(name = "medical_history", length = 1000)
    private String medicalHistory;
    
    @Column(name = "allergies", length = 500)
    private String allergies;
    
    @Column(name = "current_medications", length = 500)
    private String currentMedications;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
