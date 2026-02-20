package com.medicareplus.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.medicareplus.DTO.DoctorDetailsRequestDTO;
import com.medicareplus.Service.DoctorDetailsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/doctors/details")
@RequiredArgsConstructor
public class DoctorDetailsController {

    private final DoctorDetailsService doctorDetailsService;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getByUserId(@PathVariable Integer userId) {
        return ResponseEntity.ok(doctorDetailsService.findByUserIdOrNull(userId));
    }

    @PostMapping("/{userId}")
    public ResponseEntity<?> create(@PathVariable Integer userId, @Valid @RequestBody DoctorDetailsRequestDTO payload) {
        try {
            return ResponseEntity.ok(doctorDetailsService.saveOrUpdate(userId, payload));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> update(@PathVariable Integer userId, @Valid @RequestBody DoctorDetailsRequestDTO payload) {
        try {
            return ResponseEntity.ok(doctorDetailsService.saveOrUpdate(userId, payload));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
