package com.medicareplus.Models;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "doctor_details")
public class DoctorDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    @Column(name = "id")
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true, nullable = false)
    @JsonBackReference("user-doctor")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialization_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Specializations specialization;

    @Column(name = "experience_year")
    private Integer experienceYear;
    
    @Column(name = "clinic_address", length = 500)
    private String clinicAddress;
    
    @Column(name = "qualification", length = 200)
    private String qualification;
    
    @Column(name = "bio", length = 1000)
    private String bio;
    
    @Column(name = "consultation_fee", precision = 10, scale = 2)
    private BigDecimal consultationFee;
    
    @Column(name = "is_approved")
    private boolean approved;
    
    @Column(name = "license_certificate_url", length = 500)
    private String licenseCertificateUrl;
    
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

    // Helper method to get specialization ID
    public Long getSpecializationId() {
        return specialization != null ? specialization.getId() : null;
    }
    
    // Helper method to get specialization name
    public String getSpecializationName() {
        return specialization != null ? specialization.getName() : null;
    }
}