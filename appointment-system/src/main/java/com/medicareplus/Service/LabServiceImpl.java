package com.medicareplus.Service;

import com.medicareplus.DTO.LabResponseDTO;
import com.medicareplus.DTO.LabTestResponseDTO;
import com.medicareplus.Models.Lab;
import com.medicareplus.Models.LabTest;
import com.medicareplus.Repository.LabRepository;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class LabServiceImpl implements LabService {
    private final LabRepository labRepository;

    public LabServiceImpl(LabRepository labRepository) {
        this.labRepository = labRepository;
    }

    @Override
    public List<LabResponseDTO> getAllLabs() {
        return labRepository.findAll().stream()
                .map(this::toLabResponse)
                .collect(Collectors.toList());
    }

    @Override
    public LabResponseDTO getLabById(Integer id) {
        Lab lab = labRepository.findById(id).orElseThrow(() -> new RuntimeException("Lab not found"));
        return toLabResponse(lab);
    }

    @Override
    public LabResponseDTO addLab(Lab lab) {
        return toLabResponse(labRepository.save(lab));
    }

    @Override
    public LabResponseDTO updateLab(Integer id, Lab lab) {
        Lab existing = labRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab not found"));
        existing.setName(lab.getName());
        existing.setAddress(lab.getAddress());
        existing.setContact(lab.getContact());
        return toLabResponse(labRepository.save(existing));
    }

    @Override
    public void deleteLab(Integer id) {
        if (!labRepository.existsById(id)) {
            throw new RuntimeException("Lab not found");
        }
        labRepository.deleteById(id);
    }

    private LabResponseDTO toLabResponse(Lab lab) {
        List<LabTestResponseDTO> tests = lab.getTests() == null
                ? Collections.emptyList()
                : lab.getTests().stream().map(this::toLabTestResponse).collect(Collectors.toList());

        return LabResponseDTO.builder()
                .id(lab.getId())
                .name(lab.getName())
                .address(lab.getAddress())
                .contact(lab.getContact())
                .email(lab.getEmail())
                .registrationNumber(lab.getRegistrationNumber())
                .labType(lab.getLabType())
                .website(lab.getWebsite())
                .yearEstablished(lab.getYearEstablished())
                .homeCollection(lab.getHomeCollection())
                .emergencyServices(lab.getEmergencyServices())
                .reportTurnaround(lab.getReportTurnaround())
                .status(lab.getStatus())
                // .tests(tests)
                .build();
    }

    private LabTestResponseDTO toLabTestResponse(LabTest test) {
        return LabTestResponseDTO.builder()
                .id(test.getId())
                .testName(test.getTestName())
                .price(test.getPrice())
                .description(test.getDescription())
                .labId(test.getLab() != null ? test.getLab().getId() : null)
                .build();
    }
}
