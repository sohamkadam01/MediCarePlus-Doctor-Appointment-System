package com.medicareplus.Service;

import com.medicareplus.DTO.LabTestRequestDTO;
import com.medicareplus.DTO.LabTestResponseDTO;
import java.util.List;

public interface LabTestService {
    List<LabTestResponseDTO> getAllTests();

    LabTestResponseDTO getTestById(Integer id);

    List<LabTestResponseDTO> getTestsByLab(Integer labId);

    LabTestResponseDTO addTest(Integer labId, LabTestRequestDTO request);

    LabTestResponseDTO updateTest(Integer id, LabTestRequestDTO request);

    void deleteTest(Integer id);
}
