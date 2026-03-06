package com.medicareplus.Models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import java.time.LocalDate;
import java.time.LocalTime;
import jakarta.persistence.*;
import lombok.*;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
@Table(
        name = "doctor_availability",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_doctor_availability_slot",
                columnNames = {"doctor_id", "available_date", "start_time"}
        )
)
public class DoctorAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @JsonBackReference("doctor-availability")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User doctor;

    @Column(name = "available_date")
    private LocalDate availableDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "is_booked")
    private boolean booked;

}

