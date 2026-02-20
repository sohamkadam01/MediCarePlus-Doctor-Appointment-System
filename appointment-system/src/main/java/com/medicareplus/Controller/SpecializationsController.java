package com.medicareplus.Controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.medicareplus.Models.Specializations;
import com.medicareplus.Repository.SpecializationsRepository;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/specializations")
@RequiredArgsConstructor
public class SpecializationsController {

    private final SpecializationsRepository specializationsRepository;

    @GetMapping
    public ResponseEntity<List<Specializations>> getAll() {
        return ResponseEntity.ok(specializationsRepository.findAll());
    }
}

