package com.medicareplus.Service;

import com.medicareplus.DTO.LabSearchResponseDTO;
import com.medicareplus.Models.LabEnrollmentApplication;
import com.medicareplus.Models.LabEnrollmentStatus;
import com.medicareplus.Repository.LabEnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class LabSearchServiceImpl implements LabSearchService {

    @Autowired
    private LabEnrollmentRepository labRepository;

    @Override
    public List<LabSearchResponseDTO> searchLabs(String city, String state, String pincode) {
        List<LabEnrollmentApplication> labs;
        
        if (city != null && !city.isEmpty()) {
            if (state != null && !state.isEmpty()) {
                labs = labRepository.findByCityIgnoreCaseAndStateIgnoreCaseAndStatus(
                    city, state, LabEnrollmentStatus.APPROVED);
            } else {
                labs = labRepository.findByCityIgnoreCaseAndStatus(city, LabEnrollmentStatus.APPROVED);
            }
        } else if (pincode != null && !pincode.isEmpty()) {
            labs = labRepository.searchByLocation(pincode);
        } else {
            labs = labRepository.findAll().stream()
                .filter(l -> l.getStatus() == LabEnrollmentStatus.APPROVED)
                .collect(Collectors.toList());
        }
        
        return labs.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<String> getAllCities() {
        return labRepository.findAllCities();
    }

    @Override
    public List<String> getAllStates() {
        return labRepository.findAllStates();
    }

    @Override
    public LabSearchResponseDTO getLabById(Integer id) {
        return labRepository.findById(id)
            .map(this::convertToDTO)
            .orElse(null);
    }

    @Override
    public List<LabSearchResponseDTO> searchLabsByTestCategory(String testCategory) {
        return labRepository.findByTestCategoryContainingAndStatus(
                testCategory, LabEnrollmentStatus.APPROVED)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<LabSearchResponseDTO> getLabsWithHomeCollection(String city) {
        return labRepository.findByCityIgnoreCaseAndHomeCollectionTrueAndStatus(
                city, LabEnrollmentStatus.APPROVED)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<LabSearchResponseDTO> getAccreditedLabs(String accreditationType) {
        List<LabEnrollmentApplication> labs = new ArrayList<>();
        
        switch (accreditationType.toUpperCase()) {
            case "NABL":
                labs = labRepository.findByNablAccreditedTrueAndStatus(LabEnrollmentStatus.APPROVED);
                break;
            case "ISO":
                labs = labRepository.findByIsoCertifiedTrueAndStatus(LabEnrollmentStatus.APPROVED);
                break;
            case "CAP":
                labs = labRepository.findByCapAccreditedTrueAndStatus(LabEnrollmentStatus.APPROVED);
                break;
            default:
                // Return all labs with any accreditation
                labs = labRepository.findAll().stream()
                    .filter(l -> l.getStatus() == LabEnrollmentStatus.APPROVED)
                    .filter(l -> l.isNablAccredited() || l.isIsoCertified() || l.isCapAccredited())
                    .collect(Collectors.toList());
        }
        
        return labs.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<LabSearchResponseDTO> advancedSearch(String city, String state, 
                                                     Boolean homeCollection, 
                                                     Boolean emergencyServices) {
        return labRepository.advancedSearch(
                LabEnrollmentStatus.APPROVED, 
                city, 
                state, 
                homeCollection, 
                emergencyServices)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    private LabSearchResponseDTO convertToDTO(LabEnrollmentApplication lab) {
        return LabSearchResponseDTO.builder()
            .id(lab.getId())
            .name(lab.getLabName())
            .address(lab.getAddress())
            .city(lab.getCity())
            .state(lab.getState())
            .pincode(lab.getPincode())
            .phone(lab.getPhone())
            .email(lab.getEmail())
            .rating(calculateRating(lab))
            .homeCollection(lab.isHomeCollection())
            .emergencyServices(lab.isEmergencyServices())
            .testCategories(lab.getTestCategories() != null ? 
                lab.getTestCategories().split(",") : new String[0])
            .reportTurnaround(lab.getReportTurnaround())
            .labType(lab.getLabType())
            .yearEstablished(lab.getYearEstablished())
            .accreditations(getAccreditations(lab))
            .distance(calculateDistance(lab))
            .build();
    }

    private List<String> getAccreditations(LabEnrollmentApplication lab) {
        List<String> accreditations = new ArrayList<>();
        if (lab.isNablAccredited()) accreditations.add("NABL");
        if (lab.isIsoCertified()) accreditations.add("ISO");
        if (lab.isCapAccredited()) accreditations.add("CAP");
        if (lab.getOtherAccreditations() != null && !lab.getOtherAccreditations().isEmpty()) {
            String[] others = lab.getOtherAccreditations().split(",");
            for (String other : others) {
                accreditations.add(other.trim());
            }
        }
        return accreditations;
    }

    private Double calculateRating(LabEnrollmentApplication lab) {
        // You can implement actual rating logic here
        // For now, return a default or random rating
        return 4.5;
    }

    private String calculateDistance(LabEnrollmentApplication lab) {
        // Implement actual distance calculation using geocoding
        // For now, return a placeholder
        return "2.5 km";
    }
}