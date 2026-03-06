package com.medicareplus.Controller;

import com.medicareplus.DTO.LabTestRequestDTO;
import com.medicareplus.DTO.LabTestResponseDTO;
import com.medicareplus.Service.LabTestService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lab-tests")
@CrossOrigin(origins = "*")
public class LabTestController {
    private final LabTestService labTestService;

    public LabTestController(LabTestService labTestService) {
        this.labTestService = labTestService;
    }

    @GetMapping
    public List<LabTestResponseDTO> getAllTests() {
        return labTestService.getAllTests();
    }

    @GetMapping("/{id}")
    public LabTestResponseDTO getTestById(@PathVariable Integer id) {
        return labTestService.getTestById(id);
    }

    @GetMapping("/lab/{labId}")
    public List<LabTestResponseDTO> getTestsByLab(@PathVariable Integer labId) {
        return labTestService.getTestsByLab(labId);
    }

    @PostMapping("/lab/{labId}")
    public ResponseEntity<LabTestResponseDTO> addTest(@PathVariable Integer labId, @Valid @RequestBody LabTestRequestDTO request) {
        return new ResponseEntity<>(labTestService.addTest(labId, request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public LabTestResponseDTO updateTest(@PathVariable Integer id, @Valid @RequestBody LabTestRequestDTO request) {
        return labTestService.updateTest(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTest(@PathVariable Integer id) {
        labTestService.deleteTest(id);
        return ResponseEntity.noContent().build();
    }
}
