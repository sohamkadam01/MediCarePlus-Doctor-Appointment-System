package com.medicareplus.Service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.medicareplus.DTO.DoctorDetailsRequestDTO;
import com.medicareplus.Models.Specializations;
import com.medicareplus.Models.User;
import com.medicareplus.Models.UserRole;
import com.medicareplus.Models.UserStatus;
import com.medicareplus.Models.DoctorDetails;
import com.medicareplus.Repository.DoctorDetailsRepository;
import com.medicareplus.Repository.SpecializationsRepository;
import com.medicareplus.Repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorDetailsService {

    private final DoctorDetailsRepository doctorDetailsRepository;
    private final UserRepository userRepository;
    private final SpecializationsRepository specializationsRepository;

    public DoctorDetails getByUserId(Integer userId) {
        return doctorDetailsRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Doctor details not found for user id: " + userId));
    }

    public DoctorDetails findByUserIdOrNull(Integer userId) {
        return doctorDetailsRepository.findByUserId(userId).orElse(null);
    }

    @Transactional
    public DoctorDetails create(Integer userId, DoctorDetailsRequestDTO payload) {
        return saveOrUpdate(userId, payload);
    }

    @Transactional
    public DoctorDetails saveOrUpdate(Integer userId, DoctorDetailsRequestDTO payload) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (user.getRole() != UserRole.DOCTOR) {
            throw new RuntimeException("User is not a doctor");
        }

        Specializations specialization = specializationsRepository.findById(payload.getSpecializationId())
                .orElseThrow(() -> new RuntimeException("Specialization not found with id: " + payload.getSpecializationId()));

        // if (!payload.getAvailabilityStartTime().isBefore(payload.getAvailabilityEndTime())) {
        //     throw new RuntimeException("Availability start time must be before end time");
        // }

        DoctorDetails details = doctorDetailsRepository.findByUserId(userId).orElseGet(DoctorDetails::new);
        if (details.getId() == null) {
            details.setUser(user);
            // Keep legacy/edge-case users consistent: active doctor implies approved profile.
            details.setApproved(user.getStatus() == UserStatus.ACTIVE);
        }
   
        details.setSpecialization(specialization);
        details.setExperienceYear(payload.getExperienceYear());
        details.setClinicAddress(payload.getClinicAddress());
        details.setQualification(payload.getQualification());
        details.setBio(payload.getBio());
        details.setConsultationFee(payload.getConsultationFee());
        // details.setAvailabilityStartTime(payload.getAvailabilityStartTime());
        // details.setAvailabilityEndTime(payload.getAvailabilityEndTime());
        details.setLicenseCertificateUrl(payload.getLicenseCertificateUrl());
        details.setCity(payload.getCity());
        details.setState(payload.getState());

        DoctorDetails saved = doctorDetailsRepository.save(details);
        user.setDoctorDetails(saved);
        userRepository.save(user);
        return saved;
    }

    @Transactional
    public DoctorDetails update(Integer userId, DoctorDetailsRequestDTO payload) {
        return saveOrUpdate(userId, payload);
    }

    public List<DoctorDetails> getDoctorsNearPatient(String city, String state) {
    System.out.println("City: " + city);
System.out.println("State: " + state);
        return doctorDetailsRepository.findByCityAndStateAndApprovedTrue(city, state);
}
}
