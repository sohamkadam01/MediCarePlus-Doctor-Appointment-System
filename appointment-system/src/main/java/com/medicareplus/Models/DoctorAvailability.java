package com.medicareplus.Models;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data

@Table (name = "doctor_availability")
public class DoctorAvailability {
     @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column (name = "id")
    private int id;
    @Column (name = "doctor_id")
    private int doctor_id;

    @Column (name = "available_date")
    private LocalDate available_date;

    @Column (name = "start_time")
    private LocalTime start_time;

    @Column (name = "end_time")
    private LocalTime end_time;

    @Column (name = "is_booked")
    private boolean is_booked;

}

