package com.medicareplus.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.medicareplus.DTO.LabRequestDTO;
import com.medicareplus.DTO.LabResponseDTO;
import com.medicareplus.Models.Lab;
import com.medicareplus.Service.LabService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/labs")
@CrossOrigin(origins = "*")
public class LabController {
    private LabService labService;

    public LabController(LabService labService) {
        this.labService = labService;
    }

    @GetMapping
    public List<LabResponseDTO> getAllLabs() {
        return labService.getAllLabs();
    }

    @GetMapping("/{id}")
    public LabResponseDTO getLab(@PathVariable Integer id) {
        return labService.getLabById(id);
    }

    @PostMapping
    public ResponseEntity<LabResponseDTO> addLab(@Valid @RequestBody LabRequestDTO request) {
        Lab lab = Lab.builder()
                .name(request.getName())
                .address(request.getAddress())
                .contact(request.getContact())
                .build();
        return new ResponseEntity<>(labService.addLab(lab), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public LabResponseDTO updateLab(@PathVariable Integer id, @Valid @RequestBody LabRequestDTO request) {
        Lab lab = Lab.builder()
                .name(request.getName())
                .address(request.getAddress())
                .contact(request.getContact())
                .build();
        return labService.updateLab(id, lab);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLab(@PathVariable Integer id) {
        labService.deleteLab(id);
        return ResponseEntity.noContent().build();
    }
}

