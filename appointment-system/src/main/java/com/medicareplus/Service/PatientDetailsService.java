package com.medicareplus.Service;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.medicareplus.Models.PatientDetails;
import com.medicareplus.Models.User;
import com.medicareplus.Models.UserRole;
import com.medicareplus.Repository.PatientDetailsRepository;
import com.medicareplus.Repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PatientDetailsService {
    
    private final PatientDetailsRepository patientDetailsRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public PatientDetails createPatientDetails(Integer userId, PatientDetails patientDetails) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // Verify the user is actually a patient
        if (user.getRole() != UserRole.PATIENT) {
            throw new RuntimeException("User is not a patient. Role: " + user.getRole());
        }
        
        // Check if patient details already exist
        if (patientDetailsRepository.existsByUserId(userId)) {
            throw new RuntimeException("Patient details already exist for this user");
        }
        
        // Set the bidirectional relationship
        patientDetails.setUser(user);
        patientDetails.setCreatedAt(LocalDateTime.now());
        patientDetails.setUpdatedAt(LocalDateTime.now());
        
        // Save patient details
        PatientDetails savedDetails = patientDetailsRepository.save(patientDetails);
        
        // Update the user's patientDetails reference
        user.setPatientDetails(savedDetails);
        userRepository.save(user);
        
        return savedDetails;
    }
    
    @Transactional
    public PatientDetails updatePatientDetails(Integer userId, PatientDetails updatedDetails) {
        PatientDetails existingDetails = patientDetailsRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Patient details not found for user id: " + userId));
        
        // Update fields
        existingDetails.setDateOfBirth(updatedDetails.getDateOfBirth());
        existingDetails.setAge(updatedDetails.getAge());
        existingDetails.setGender(updatedDetails.getGender());
        existingDetails.setBloodGroup(updatedDetails.getBloodGroup());
        existingDetails.setAddress(updatedDetails.getAddress());
        existingDetails.setCity(updatedDetails.getCity());
        existingDetails.setState(updatedDetails.getState());
        existingDetails.setCountry(updatedDetails.getCountry());
        existingDetails.setPincode(updatedDetails.getPincode());
        existingDetails.setEmergencyContactName(updatedDetails.getEmergencyContactName());
        existingDetails.setEmergencyContactPhone(updatedDetails.getEmergencyContactPhone());
        existingDetails.setMedicalHistory(updatedDetails.getMedicalHistory());
        existingDetails.setAllergies(updatedDetails.getAllergies());
        existingDetails.setCurrentMedications(updatedDetails.getCurrentMedications());
        existingDetails.setUpdatedAt(LocalDateTime.now());
        
        return patientDetailsRepository.save(existingDetails);
    }
    
    public PatientDetails getPatientDetailsByUserId(Integer userId) {
        return patientDetailsRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Patient details not found for user id: " + userId));
    }
    
    public PatientDetails getPatientDetailsByUserEmail(String email) {
        return patientDetailsRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient details not found for email: " + email));
    }
    
    public PatientDetails getPatientDetailsByUserPhone(String phone) {
        return patientDetailsRepository.findByUserPhone(phone)
                .orElseThrow(() -> new RuntimeException("Patient details not found for phone: " + phone));
    }
    
    public List<PatientDetails> getAllPatients() {
        return patientDetailsRepository.findAll();
    }
    
    public List<PatientDetails> getPatientsByCity(String city) {
        return patientDetailsRepository.findByCity(city);
    }
    
    public List<PatientDetails> getPatientsByBloodGroup(String bloodGroup) {
        return patientDetailsRepository.findByBloodGroup(bloodGroup);
    }
    
    public long getPatientCount() {
        return patientDetailsRepository.count();
    }
    
    public long getPatientCountByBloodGroup(String bloodGroup) {
        return patientDetailsRepository.countByBloodGroup(bloodGroup);
    }
    
    @Transactional
    public void deletePatientDetails(Integer userId) {
        PatientDetails details = patientDetailsRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Patient details not found for user id: " + userId));
        
        // Remove the relationship from User side
        User user = details.getUser();
        if (user != null) {
            user.setPatientDetails(null);
            userRepository.save(user);
        }
        
        patientDetailsRepository.delete(details);
    }
    
    @Transactional
    public void deletePatientDetailsById(Integer detailsId) {
        PatientDetails details = patientDetailsRepository.findById(detailsId)
                .orElseThrow(() -> new RuntimeException("Patient details not found with id: " + detailsId));
        
        // Remove the relationship from User side
        User user = details.getUser();
        if (user != null) {
            user.setPatientDetails(null);
            userRepository.save(user);
        }
        
        patientDetailsRepository.delete(details);
    }
    
    public boolean hasPatientDetails(Integer userId) {
        return patientDetailsRepository.existsByUserId(userId);
    }
}