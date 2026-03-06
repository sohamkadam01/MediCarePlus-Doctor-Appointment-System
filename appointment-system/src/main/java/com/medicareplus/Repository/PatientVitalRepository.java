package com.medicareplus.Repository;

import com.medicareplus.Models.PatientVital;
import com.medicareplus.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PatientVitalRepository extends JpaRepository<PatientVital, Long> {
    
    // Find all vitals for a patient ordered by date (most recent first)
    List<PatientVital> findByPatientOrderByRecordedAtDesc(User patient);
    
    // Find latest vital for a patient
    Optional<PatientVital> findTopByPatientOrderByRecordedAtDesc(User patient);
    
    // Find vitals within a date range
    List<PatientVital> findByPatientAndRecordedAtBetweenOrderByRecordedAtDesc(
            User patient, LocalDateTime startDate, LocalDateTime endDate);
    
    // Find vitals with abnormal readings (example - you can customize thresholds)
    List<PatientVital> findByPatientAndSystolicBpGreaterThanEqualOrDiastolicBpGreaterThanEqual(
            User patient, Integer systolicThreshold, Integer diastolicThreshold);
    
    // Delete all vitals for a patient
    void deleteByPatient(User patient);
}