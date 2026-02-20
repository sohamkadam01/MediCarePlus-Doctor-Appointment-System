package com.medicareplus.Models;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "specializations")
public class Specializations {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;   // Cardiologist, Dermatologist

    @Column(length = 500)
    private String description;

    // One specialization → many doctors
    @OneToMany(mappedBy = "specialization", fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<DoctorDetails> doctors;
    
}