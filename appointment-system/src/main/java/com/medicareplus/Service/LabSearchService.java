package com.medicareplus.Service;

import com.medicareplus.DTO.LabSearchResponseDTO;
import java.util.List;

public interface LabSearchService {
    List<LabSearchResponseDTO> searchLabs(String city, String state, String pincode);
    List<String> getAllCities();
    List<String> getAllStates();
    LabSearchResponseDTO getLabById(Integer id);
    List<LabSearchResponseDTO> searchLabsByTestCategory(String testCategory);
    List<LabSearchResponseDTO> getLabsWithHomeCollection(String city);
    List<LabSearchResponseDTO> getAccreditedLabs(String accreditationType);
    List<LabSearchResponseDTO> advancedSearch(String city, String state, Boolean homeCollection, Boolean emergencyServices);
}