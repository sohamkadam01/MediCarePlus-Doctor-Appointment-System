// package com.medicareplus.Service;

// import java.util.List;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;
// import com.medicareplus.Models.DoctorDetails;
// import com.medicareplus.Models.Specializations;
// import com.medicareplus.Repository.DoctorDetailsRepository;
// import com.medicareplus.Repository.SpecializationsRepository;

// @Service
// public class DoctorSearchService {
    
//     @Autowired
//     private DoctorDetailsRepository doctorRepository;
    
//     @Autowired
//     private SpecializationsRepository specializationRepository;
    
//     public List<DoctorDetails> findNearbyDoctors(String patientCity, String patientState) {
//         if (patientCity == null || patientState == null) {
//             throw new IllegalArgumentException("City and state cannot be null");
//         }
//         return doctorRepository.findByCityAndStateAndApprovedTrue(
//             patientCity.trim(), patientState.trim());
//     }
    
//     public List<DoctorDetails> findNearbyDoctorsBySpecializationId(
//             String patientCity, String patientState, Integer specializationId) {
        
//         if (specializationId == null) {
//             return findNearbyDoctors(patientCity, patientState);
//         }
        
//         // Convert Integer to Long when calling the repository
//         return doctorRepository.findByCityAndStateAndSpecializationIdAndApprovedTrue(
//             patientCity, patientState, specializationId.longValue());
//     }
    
//     public List<DoctorDetails> findNearbyDoctorsBySpecializationObject(
//             String patientCity, String patientState, Integer specializationId) {
        
//         if (specializationId == null) {
//             return findNearbyDoctors(patientCity, patientState);
//         }
        
//         // Convert Integer to Long for findById
//         Specializations specialization = specializationRepository.findById(specializationId.longValue())
//             .orElseThrow(() -> new RuntimeException("Specialization not found with id: " + specializationId));
        
//         return doctorRepository.findByCityAndStateAndSpecializationAndApprovedTrue(
//             patientCity, patientState, specialization);
//     }
    
//     // Using the case-insensitive query
//     public List<DoctorDetails> findNearbyDoctorsCaseInsensitive(
//             String patientCity, String patientState, Integer specializationId) {
        
//         if (specializationId == null) {
//             return doctorRepository.findApprovedDoctorsByLocation(patientCity, patientState);
//         }
        
//         // Convert Integer to Long for the query parameter
//         return doctorRepository.findApprovedDoctorsByLocationAndSpecialization(
//             patientCity, patientState, specializationId.longValue());
//     }
// }