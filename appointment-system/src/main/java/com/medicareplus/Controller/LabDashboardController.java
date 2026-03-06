package com.medicareplus.Controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicareplus.DTO.LabAnalysisDTO;
import com.medicareplus.DTO.LabDashboardAppointmentDTO;
import com.medicareplus.DTO.LabInstrumentStatusDTO;
import com.medicareplus.DTO.LabMetricDTO;
import com.medicareplus.DTO.LabPatientAppointmentDTO;
import com.medicareplus.Models.Lab;
import com.medicareplus.Models.User;
import com.medicareplus.Repository.LabRepository;
import com.medicareplus.Service.LabAppointmentService;
import com.medicareplus.Service.UserService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/lab")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class LabDashboardController {
    private final LabAppointmentService labAppointmentService;
    private final UserService userService;
    private final LabRepository labRepository;

    @GetMapping("/appointments/today")
    public ResponseEntity<List<LabDashboardAppointmentDTO>> getTodayAppointments() {
        String email = getCurrentUserEmail();
        return ResponseEntity.ok(labAppointmentService.getLabAppointmentsForDate(email, LocalDate.now()));
    }

    @GetMapping("/appointments/history")
    public ResponseEntity<List<LabPatientAppointmentDTO>> getAppointmentHistory() {
        String email = getCurrentUserEmail();
        return ResponseEntity.ok(labAppointmentService.getLabAppointments(email));
    }

    @PutMapping("/appointments/{appointmentId}/status")
    public ResponseEntity<Map<String, Object>> updateAppointmentStatus(
            @PathVariable Long appointmentId,
            @RequestBody Map<String, Object> payload) {
        Object status = payload.get("status");
        labAppointmentService.updateLabAppointmentStatus(appointmentId, status != null ? status.toString() : null);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "appointmentId", appointmentId,
                "status", status
        ));
    }

    @GetMapping("/analyses/active")
    public ResponseEntity<List<LabAnalysisDTO>> getActiveAnalyses() {
        String email = getCurrentUserEmail();
        return ResponseEntity.ok(labAppointmentService.getActiveAnalyses(email));
    }

    @GetMapping("/metrics/quality")
    public ResponseEntity<List<LabMetricDTO>> getQualityMetrics() {
        String email = getCurrentUserEmail();
        return ResponseEntity.ok(labAppointmentService.getQualityMetrics(email, LocalDate.now()));
    }

    @GetMapping("/instruments/status")
    public ResponseEntity<List<LabInstrumentStatusDTO>> getInstrumentStatus() {
        User user = getCurrentUser();
        Lab lab = labRepository.findByUserId(user.getId()).orElse(null);
        Integer labId = lab != null ? lab.getId() : null;
        return ResponseEntity.ok(labAppointmentService.getInstrumentStatus(labId));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userService.getUserByEmail(username);
    }

    private String getCurrentUserEmail() {
        return getCurrentUser().getEmail();
    }
}
