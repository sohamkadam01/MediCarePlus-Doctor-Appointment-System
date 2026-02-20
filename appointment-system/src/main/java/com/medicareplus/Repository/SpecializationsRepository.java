package com.medicareplus.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.medicareplus.Models.Specializations;

@Repository
public interface SpecializationsRepository extends JpaRepository<Specializations, Long> {
}
