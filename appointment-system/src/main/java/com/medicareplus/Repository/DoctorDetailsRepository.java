package com.medicareplus.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medicareplus.Models.DoctorDetails;

@Repository
public interface DoctorDetailsRepository extends JpaRepository<DoctorDetails, Integer> {
    Optional<DoctorDetails> findByUserId(Integer userId);
    boolean existsByUserId(Integer userId);
List<DoctorDetails> findByCityAndStateAndApprovedTrue(String city, String state);
    
    }
