package com.medicareplus.Service;

import com.medicareplus.DTO.LabTestRequestDTO;
import com.medicareplus.DTO.LabTestResponseDTO;
import com.medicareplus.Models.Lab;
import com.medicareplus.Models.LabTest;
import com.medicareplus.Repository.LabRepository;
import com.medicareplus.Repository.LabTestRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class LabTestServiceImpl implements LabTestService {
    private final LabTestRepository labTestRepository;
    private final LabRepository labRepository;

    public LabTestServiceImpl(LabTestRepository labTestRepository, LabRepository labRepository) {
        this.labTestRepository = labTestRepository;
        this.labRepository = labRepository;
    }

    @Override
    public List<LabTestResponseDTO> getAllTests() {
        return labTestRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public LabTestResponseDTO getTestById(Integer id) {
        LabTest test = labTestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab test not found"));
        return toResponse(test);
    }

    @Override
    public List<LabTestResponseDTO> getTestsByLab(Integer labId) {
        return labTestRepository.findByLabId(labId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public LabTestResponseDTO addTest(Integer labId, LabTestRequestDTO request) {
        Lab lab = labRepository.findById(labId)
                .orElseThrow(() -> new RuntimeException("Lab not found"));

        LabTest test = LabTest.builder()
                .lab(lab)
                .testName(request.getTestName())
                .price(request.getPrice())
                .description(request.getDescription())
                .build();

        return toResponse(labTestRepository.save(test));
    }

    @Override
    public LabTestResponseDTO updateTest(Integer id, LabTestRequestDTO request) {
        LabTest existing = labTestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab test not found"));

        existing.setTestName(request.getTestName());
        existing.setPrice(request.getPrice());
        existing.setDescription(request.getDescription());

        return toResponse(labTestRepository.save(existing));
    }

    @Override
    public void deleteTest(Integer id) {
        if (!labTestRepository.existsById(id)) {
            throw new RuntimeException("Lab test not found");
        }
        labTestRepository.deleteById(id);
    }

    private LabTestResponseDTO toResponse(LabTest test) {
        return LabTestResponseDTO.builder()
                .id(test.getId())
                .testName(test.getTestName())
                .price(test.getPrice())
                .description(test.getDescription())
                .labId(test.getLab() != null ? test.getLab().getId() : null)
                .build();
    }
}
