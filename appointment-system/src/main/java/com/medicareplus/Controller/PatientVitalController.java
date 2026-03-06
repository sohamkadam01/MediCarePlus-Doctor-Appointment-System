package com.medicareplus.Controller;

import com.medicareplus.Models.PatientVital;
import com.medicareplus.Service.PatientVitalService;
import com.medicareplus.DTO.PatientVitalDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patient-vitals")
@CrossOrigin(origins = "*")
public class PatientVitalController {

    @Autowired
    private PatientVitalService patientVitalService;

    @PostMapping
    public ResponseEntity<?> saveVitals(@RequestBody PatientVitalDTO vitalDTO) {
        try {
            // Validate patientId
            if (vitalDTO.getPatientId() == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Patient ID is required"));
            }

            PatientVital saved = patientVitalService.saveVitals(vitalDTO);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to save vitals: " + e.getMessage()));
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPatientVitals(@PathVariable Integer patientId) {
        try {
            List<PatientVital> vitals = patientVitalService.getPatientVitals(patientId);
            return ResponseEntity.ok(vitals);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch vitals"));
        }
    }

    @GetMapping("/patient/{patientId}/latest")
    public ResponseEntity<?> getLatestVitals(@PathVariable Integer patientId) {
        try {
            PatientVital vital = patientVitalService.getLatestVitals(patientId);
            if (vital == null) {
                return ResponseEntity.ok(Map.of("message", "No vitals found for this patient"));
            }
            return ResponseEntity.ok(vital);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch latest vitals"));
        }
    }

    @GetMapping("/patient/{patientId}/range")
    public ResponseEntity<?> getVitalsByDateRange(
            @PathVariable Integer patientId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            List<PatientVital> vitals = patientVitalService.getPatientVitalsByDateRange(patientId, startDate, endDate);
            return ResponseEntity.ok(vitals);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch vitals"));
        }
    }

    @DeleteMapping("/{vitalId}")
    public ResponseEntity<?> deleteVitals(@PathVariable Long vitalId) {
        try {
            patientVitalService.deletePatientVitals(vitalId);
            return ResponseEntity.ok(Map.of("message", "Vitals deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete vitals"));
        }
    }
}
