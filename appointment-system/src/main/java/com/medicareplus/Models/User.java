package com.medicareplus.Models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name")
    private String name;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(nullable = false)
    private boolean verified = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRole role;

    @Column(name = "phone", unique = true)
    private String phone;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private UserStatus status = UserStatus.ACTIVE;

    /*
     * =========================
     *  One-to-One Relationships
     * =========================
     */

    @OneToOne(mappedBy = "user",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    @JsonManagedReference("user-patient")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private PatientDetails patientDetails;

    @OneToOne(mappedBy = "user",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    @JsonIgnore   
    @JsonManagedReference("user-doctor")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private DoctorDetails doctorDetails;   // ✅ Fixed naming


    /*
     * =========================
     *  One-to-Many Relationships (Appointments)
     * =========================
     */

    // As Patient
    @OneToMany(mappedBy = "patient",
            cascade = {CascadeType.PERSIST, CascadeType.MERGE},
            fetch = FetchType.LAZY)
    @JsonManagedReference("patient-appointments")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Appointment> patientAppointments = new ArrayList<>();

    // As Doctor
    @OneToMany(mappedBy = "doctor",
            cascade = {CascadeType.PERSIST, CascadeType.MERGE},
            fetch = FetchType.LAZY)
    @JsonManagedReference("doctor-appointments")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Appointment> doctorAppointments = new ArrayList<>();

    @OneToMany(mappedBy = "doctor",
            cascade = {CascadeType.PERSIST, CascadeType.MERGE},
            fetch = FetchType.LAZY)
    @JsonManagedReference("doctor-availability")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<DoctorAvailability> doctorAvailabilities = new ArrayList<>();


    /*
     * =========================
     *  Lifecycle Hooks
     * =========================
     */

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /*
     * =========================
     *  Helper Methods
     * =========================
     */

    public void setPatientDetails(PatientDetails patientDetails) {
        this.patientDetails = patientDetails;
        if (patientDetails != null) {
            patientDetails.setUser(this);
        }
    }

    public void setDoctorDetails(DoctorDetails doctorDetails) {
        this.doctorDetails = doctorDetails;
        if (doctorDetails != null) {
            doctorDetails.setUser(this);
        }
    }
    
    // Helper method to add appointment as patient
    public void addPatientAppointment(Appointment appointment) {
        patientAppointments.add(appointment);
        appointment.setPatient(this);
    }
    
    // Helper method to add appointment as doctor
    public void addDoctorAppointment(Appointment appointment) {
        doctorAppointments.add(appointment);
        appointment.setDoctor(this);
    }
    
    // Helper method to remove appointment as patient
    public void removePatientAppointment(Appointment appointment) {
        patientAppointments.remove(appointment);
        appointment.setPatient(null);
    }
    
    // Helper method to remove appointment as doctor
    public void removeDoctorAppointment(Appointment appointment) {
        doctorAppointments.remove(appointment);
        appointment.setDoctor(null);
    }

    public void addDoctorAvailability(DoctorAvailability availability) {
        doctorAvailabilities.add(availability);
        availability.setDoctor(this);
    }

    public void removeDoctorAvailability(DoctorAvailability availability) {
        doctorAvailabilities.remove(availability);
        availability.setDoctor(null);
    }
}
