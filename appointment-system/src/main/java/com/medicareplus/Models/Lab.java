package com.medicareplus.Models;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "labs")
public class Lab {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;        
    private String address;     
    private String contact;     
    private String email;       
    
    @Column(name = "user_id", unique = true)
    private Integer userId;     
    
    @Column(name = "registration_number")
    private String registrationNumber;  
    
    @Column(name = "lab_type")
    private String labType;      
    
    private String website;       
    
    @Column(name = "year_established")
    private Integer yearEstablished;
    
    @Column(name = "home_collection")
    private Boolean homeCollection;
    
    @Column(name = "emergency_services")
    private Boolean emergencyServices;
    
    @Column(name = "report_turnaround")
    private Integer reportTurnaround;
    
    @Column(name = "license_doc_path")
    private String licenseDocPath;
    
    @Column(name = "logo_path")
    private String logoPath;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private LabEnrollmentStatus status;

    @OneToMany(mappedBy = "lab", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<LabTest> tests; 
}
