package com.medicareplus.Service;

import java.util.List;
import com.medicareplus.DTO.LabResponseDTO;
import com.medicareplus.Models.Lab;

public interface LabService {
    List<LabResponseDTO> getAllLabs();

    LabResponseDTO getLabById(Integer id);

    LabResponseDTO addLab(Lab lab);

    LabResponseDTO updateLab(Integer id, Lab lab);

    void deleteLab(Integer id);
}
