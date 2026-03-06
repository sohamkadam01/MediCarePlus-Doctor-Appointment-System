package com.medicareplus.Controller;

import com.medicareplus.DTO.LabEnrollmentRequestDTO;
import com.medicareplus.DTO.LabEnrollmentResponseDTO;
import com.medicareplus.Models.Lab;
import com.medicareplus.Models.LabEnrollmentApplication;
import com.medicareplus.Models.LabEnrollmentStatus;
import com.medicareplus.Models.User;
import com.medicareplus.Repository.LabEnrollmentRepository;
import com.medicareplus.Repository.LabRepository;
import com.medicareplus.Repository.UserRepository;
import com.medicareplus.Service.LabEnrollmentService;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ModelAttribute;

@RestController
@RequestMapping("/api/lab-enrollments")
@CrossOrigin(origins = "*")
public class LabEnrollmentController {
    private final LabEnrollmentService labEnrollmentService;

    @Autowired
    private LabEnrollmentRepository labRepository;

    @Autowired
    private LabRepository labProfileRepository;

    @Autowired
    private UserRepository userRepository;

    public LabEnrollmentController(LabEnrollmentService labEnrollmentService) {
        this.labEnrollmentService = labEnrollmentService;
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<LabEnrollmentResponseDTO> submitEnrollment(
            @Valid @ModelAttribute LabEnrollmentRequestDTO request) {
        return new ResponseEntity<>(labEnrollmentService.submitEnrollment(request), HttpStatus.CREATED);
    }


    
    @GetMapping("/search")
    public ResponseEntity<?> searchLabs(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String pincode) {
        
        List<LabEnrollmentApplication> labs;
        
        if (city != null && !city.isEmpty()) {
            if (state != null && !state.isEmpty()) {
                labs = labRepository.findByCityIgnoreCaseAndStateIgnoreCaseAndStatus(
                    city, state, LabEnrollmentStatus.APPROVED);
            } else {
                labs = labRepository.findByCityIgnoreCaseAndStatus(city, LabEnrollmentStatus.APPROVED);
            }
        } else if (pincode != null && !pincode.isEmpty()) {
            labs = labRepository.searchByLocation(pincode);
        } else {
            labs = labRepository.findAll().stream()
                .filter(l -> l.getStatus() == LabEnrollmentStatus.APPROVED)
                .collect(Collectors.toList());
        }
        
        // Transform to a more frontend-friendly format
        List<Map<String, Object>> formattedLabs = labs.stream()
            .map(this::formatLabResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(formattedLabs);
    }


        @GetMapping("/cities")
    public ResponseEntity<?> getAllCities() {
        List<String> cities = labRepository.findAllCities();
        return ResponseEntity.ok(cities);
    }

    @GetMapping("/states")
    public ResponseEntity<?> getAllStates() {
        List<String> states = labRepository.findAllStates();
        return ResponseEntity.ok(states);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getEnrollmentForUser(@PathVariable Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Lab lab = labProfileRepository.findByUserId(userId).orElse(null);
        if (lab != null) {
            return ResponseEntity.ok(buildLabInfoFromLab(lab));
        }

        LabEnrollmentApplication enrollment = labRepository
                .findFirstByEmailOrderByUpdatedAtDesc(user.getEmail())
                .orElseThrow(() -> new RuntimeException("Lab enrollment not found"));
        return ResponseEntity.ok(buildLabInfoFromEnrollment(enrollment));
    }

    
    private List<String> getAccreditations(LabEnrollmentApplication lab) {
        List<String> accreditations = new java.util.ArrayList<>();
        if (lab.isNablAccredited()) accreditations.add("NABL");
        if (lab.isIsoCertified()) accreditations.add("ISO");
        if (lab.isCapAccredited()) accreditations.add("CAP");
        return accreditations;
    }

    // Define the formatLabResponse method here
    private Map<String, Object> formatLabResponse(LabEnrollmentApplication lab) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", lab.getId());
        response.put("name", lab.getLabName());
        response.put("address", lab.getAddress());
        response.put("city", lab.getCity());
        response.put("state", lab.getState());
        response.put("pincode", lab.getPincode());
        response.put("phone", lab.getPhone());
        response.put("email", lab.getEmail());
        response.put("rating", 4.5); 
        response.put("homeCollection", lab.isHomeCollection());
        response.put("emergencyServices", lab.isEmergencyServices());
        response.put("testCategories", lab.getTestCategories() != null ? 
            lab.getTestCategories().split(",") : new String[0]);
        response.put("reportTurnaround", lab.getReportTurnaround());
        response.put("labType", lab.getLabType());
        response.put("yearEstablished", lab.getYearEstablished());
        return response;
    }

    private Map<String, Object> buildLabInfoFromLab(Lab lab) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", lab.getId());
        response.put("labName", lab.getName());
        response.put("labType", lab.getLabType());
        response.put("status", lab.getStatus() != null ? lab.getStatus().name() : null);
        response.put("email", lab.getEmail());
        response.put("phone", lab.getContact());
        return response;
    }

    private Map<String, Object> buildLabInfoFromEnrollment(LabEnrollmentApplication lab) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", lab.getId());
        response.put("labName", lab.getLabName());
        response.put("labType", lab.getLabType());
        response.put("status", lab.getStatus() != null ? lab.getStatus().name() : null);
        response.put("email", lab.getEmail());
        response.put("phone", lab.getPhone());
        return response;
    }

    @GetMapping
    public List<LabEnrollmentResponseDTO> getAllEnrollments() {
        return labEnrollmentService.getAllEnrollments();
    }

    @GetMapping("/{id}")
    public LabEnrollmentResponseDTO getEnrollment(@PathVariable Integer id) {
        return labEnrollmentService.getEnrollmentById(id);
    }

    // Admin approval/rejection moved to AdminController under /api/admin/lab-enrollments/{id}
}
