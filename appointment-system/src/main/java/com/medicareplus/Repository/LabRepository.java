package com.medicareplus.Repository;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.medicareplus.Models.Lab;
@Repository
public interface LabRepository extends JpaRepository <Lab, Integer> {
    boolean existsByNameAndContact(String name, String contact);
    Optional<Lab> findByUserId(Integer userId); // Add this if you have userId in Lab entity
    Optional<Lab> findByEmail(String email);

} 
    

