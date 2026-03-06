package com.medicareplus.Models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "specializations")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<DoctorDetails> doctors;
    
}
