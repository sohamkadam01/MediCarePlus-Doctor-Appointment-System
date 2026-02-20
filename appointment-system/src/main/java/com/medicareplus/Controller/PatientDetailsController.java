package com.medicareplus.Controller;

import java.util.List;
import com.medicareplus.Models.PatientDetails;
import com.medicareplus.Service.PatientDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patient-details")
@RequiredArgsConstructor
public class PatientDetailsController {

    private final PatientDetailsService patientDetailsService;

    @PostMapping("/{userId}")
    public ResponseEntity<?> createPatientDetails(@PathVariable Integer userId, @RequestBody PatientDetails patientDetails) {
        try {
            PatientDetails created = patientDetailsService.createPatientDetails(userId, patientDetails);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updatePatientDetails(@PathVariable Integer userId, @RequestBody PatientDetails patientDetails) {
        try {
            PatientDetails updated = patientDetailsService.updatePatientDetails(userId, patientDetails);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getByUserId(@PathVariable Integer userId) {
        try {
            return ResponseEntity.ok(patientDetailsService.getPatientDetailsByUserId(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<?> getByEmail(@PathVariable String email) {
        try {
            return ResponseEntity.ok(patientDetailsService.getPatientDetailsByUserEmail(email));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/phone/{phone}")
    public ResponseEntity<?> getByPhone(@PathVariable String phone) {
        try {
            return ResponseEntity.ok(patientDetailsService.getPatientDetailsByUserPhone(phone));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<PatientDetails>> getAllPatients() {
        return ResponseEntity.ok(patientDetailsService.getAllPatients());
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<PatientDetails>> getPatientsByCity(@PathVariable String city) {
        return ResponseEntity.ok(patientDetailsService.getPatientsByCity(city));
    }

    @GetMapping("/blood-group/{bloodGroup}")
    public ResponseEntity<List<PatientDetails>> getPatientsByBloodGroup(@PathVariable String bloodGroup) {
        return ResponseEntity.ok(patientDetailsService.getPatientsByBloodGroup(bloodGroup));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getPatientCount() {
        return ResponseEntity.ok(patientDetailsService.getPatientCount());
    }

    @GetMapping("/count/blood-group/{bloodGroup}")
    public ResponseEntity<Long> getPatientCountByBloodGroup(@PathVariable String bloodGroup) {
        return ResponseEntity.ok(patientDetailsService.getPatientCountByBloodGroup(bloodGroup));
    }

    @GetMapping("/exists/{userId}")
    public ResponseEntity<Boolean> hasPatientDetails(@PathVariable Integer userId) {
        return ResponseEntity.ok(patientDetailsService.hasPatientDetails(userId));
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<?> deleteByUserId(@PathVariable Integer userId) {
        try {
            patientDetailsService.deletePatientDetails(userId);
            return ResponseEntity.ok("Patient details deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/{detailsId}")
    public ResponseEntity<?> deleteByDetailsId(@PathVariable Integer detailsId) {
        try {
            patientDetailsService.deletePatientDetailsById(detailsId);
            return ResponseEntity.ok("Patient details deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
