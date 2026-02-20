package com.medicareplus.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.medicareplus.Models.PatientDetails;

@Repository
public interface PatientDetailsRepository extends JpaRepository<PatientDetails, Integer> {
    
    // Find patient details by user ID
    Optional<PatientDetails> findByUserId(Integer userId);
    
    // Check if patient details exist for a user
    boolean existsByUserId(Integer userId);
    
    // Find patient details by user email using JPQL
    @Query("SELECT pd FROM PatientDetails pd WHERE pd.user.email = :email")
    Optional<PatientDetails> findByUserEmail(@Param("email") String email);
    
    // Find patient details by user phone using JPQL
    @Query("SELECT pd FROM PatientDetails pd WHERE pd.user.phone = :phone")
    Optional<PatientDetails> findByUserPhone(@Param("phone") String phone);
    
    // Find patients by city
    List<PatientDetails> findByCity(String city);
    
    // Find patients by blood group
    List<PatientDetails> findByBloodGroup(String bloodGroup);
    
    // Count patients by blood group
    long countByBloodGroup(String bloodGroup);
    
    // Find patients by gender
    List<PatientDetails> findByGender(String gender);
    
    // Find patients by age range
    List<PatientDetails> findByAgeBetween(Integer minAge, Integer maxAge);
    
    // Custom query to get all patients with their user details
    @Query("SELECT pd FROM PatientDetails pd JOIN FETCH pd.user")
    List<PatientDetails> findAllWithUser();
    
    // Get count of patients by city
    @Query("SELECT pd.city, COUNT(pd) FROM PatientDetails pd GROUP BY pd.city")
    List<Object[]> countPatientsByCity();
}