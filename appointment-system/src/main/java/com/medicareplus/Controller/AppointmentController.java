package com.medicareplus.Controller;

import com.medicareplus.Models.Appointment;
import com.medicareplus.Service.AppointmentService;
import com.medicareplus.Service.UserService;
import com.medicareplus.DTO.AppointmentRequestDTO;
import com.medicareplus.DTO.AppointmentResponseDTO;
import com.medicareplus.DTO.AppointmentUpdateDTO;
import com.medicareplus.DTO.DoctorAppointmentStats;
import com.medicareplus.DTO.FeedbackDTO;
import com.medicareplus.DTO.PatientAppointmentStats;
import com.medicareplus.Security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin("*")
@RequiredArgsConstructor
public class AppointmentController {
    
    private final AppointmentService appointmentService;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    
    // Helper method to get current user ID from token
    private Integer getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userService.getUserByEmail(username).getId();
    }
    
    // Book new appointment
    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(@RequestBody AppointmentRequestDTO request) {
        try {
            Integer patientId = getCurrentUserId();
            AppointmentResponseDTO response = appointmentService.bookAppointment(patientId, request);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Get appointment by ID
    @GetMapping("/{appointmentId}")
    public ResponseEntity<?> getAppointmentById(@PathVariable Long appointmentId) {
        try {
            AppointmentResponseDTO response = appointmentService.getAppointmentById(appointmentId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Get all appointments for current patient
    @GetMapping("/patient")
    public ResponseEntity<?> getPatientAppointments() {
        try {
            Integer patientId = getCurrentUserId();
            List<AppointmentResponseDTO> appointments = appointmentService.getPatientAppointments(patientId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Get upcoming appointments for current patient
    @GetMapping("/patient/upcoming")
    public ResponseEntity<?> getPatientUpcomingAppointments() {
        try {
            Integer patientId = getCurrentUserId();
            List<AppointmentResponseDTO> appointments = appointmentService.getPatientUpcomingAppointments(patientId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Get past appointments for current patient
    @GetMapping("/patient/past")
    public ResponseEntity<?> getPatientPastAppointments() {
        try {
            Integer patientId = getCurrentUserId();
            List<AppointmentResponseDTO> appointments = appointmentService.getPatientPastAppointments(patientId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Get all appointments for current doctor
    @GetMapping("/doctor")
    public ResponseEntity<?> getDoctorAppointments() {
        try {
            Integer doctorId = getCurrentUserId();
            List<AppointmentResponseDTO> appointments = appointmentService.getDoctorAppointments(doctorId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Get upcoming appointments for current doctor
    @GetMapping("/doctor/upcoming")
    public ResponseEntity<?> getDoctorUpcomingAppointments() {
        try {
            Integer doctorId = getCurrentUserId();
            List<AppointmentResponseDTO> appointments = appointmentService.getDoctorUpcomingAppointments(doctorId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Get past appointments for current doctor
    @GetMapping("/doctor/past")
    public ResponseEntity<?> getDoctorPastAppointments() {
        try {
            Integer doctorId = getCurrentUserId();
            List<AppointmentResponseDTO> appointments = appointmentService.getDoctorPastAppointments(doctorId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Get today's appointments for current doctor
    @GetMapping("/doctor/today")
    public ResponseEntity<?> getDoctorTodayAppointments() {
        try {
            Integer doctorId = getCurrentUserId();
            List<AppointmentResponseDTO> appointments = appointmentService.getDoctorTodayAppointments(doctorId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Cancel appointment
    @PutMapping("/{appointmentId}/cancel")
    public ResponseEntity<?> cancelAppointment(
            @PathVariable Long appointmentId,
            @RequestBody(required = false) CancelRequest request) {
        try {
            String reason = request != null ? request.getReason() : null;
            AppointmentResponseDTO response = appointmentService.cancelAppointment(appointmentId, reason);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Reschedule appointment
    @PutMapping("/{appointmentId}/reschedule")
    public ResponseEntity<?> rescheduleAppointment(
            @PathVariable Long appointmentId,
            @RequestBody RescheduleRequest request) {
        try {
            AppointmentResponseDTO response = appointmentService.rescheduleAppointment(
                    appointmentId, request.getNewDate(), request.getNewTime());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Confirm appointment (doctor only)
    @PutMapping("/{appointmentId}/confirm")
    public ResponseEntity<?> confirmAppointment(@PathVariable Long appointmentId) {
        try {
            AppointmentResponseDTO response = appointmentService.confirmAppointment(appointmentId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Complete appointment (doctor only)
    @PutMapping("/{appointmentId}/complete")
    public ResponseEntity<?> completeAppointment(@PathVariable Long appointmentId) {
        try {
            AppointmentResponseDTO response = appointmentService.completeAppointment(appointmentId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Add prescription to appointment
    @PostMapping("/{appointmentId}/prescription")
    public ResponseEntity<?> addPrescription(
            @PathVariable Long appointmentId,
            @RequestBody PrescriptionRequest request) {
        try {
            AppointmentResponseDTO response = appointmentService.addPrescription(
                    appointmentId, request.getPrescription(), request.getDiagnosis());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Add feedback to appointment
    @PostMapping("/{appointmentId}/feedback")
    public ResponseEntity<?> addFeedback(
            @PathVariable Long appointmentId,
            @RequestBody FeedbackDTO feedback) {
        try {
            AppointmentResponseDTO response = appointmentService.addFeedback(appointmentId, feedback);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Get available time slots for doctor
    @GetMapping("/available-slots")
    public ResponseEntity<?> getAvailableSlots(
            @RequestParam Integer doctorId,
            @RequestParam LocalDate date) {
        try {
            List<LocalTime> availableSlots = appointmentService.getAvailableTimeSlots(doctorId, date);
            return ResponseEntity.ok(availableSlots);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Check if time slot is available
    @GetMapping("/check-availability")
    public ResponseEntity<?> checkAvailability(
            @RequestParam Integer doctorId,
            @RequestParam LocalDate date,
            @RequestParam LocalTime time) {
        try {
            boolean isAvailable = appointmentService.isTimeSlotAvailable(doctorId, date, time);
            return ResponseEntity.ok(new AvailabilityResponse(isAvailable));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Get patient appointment statistics
    @GetMapping("/patient/stats")
    public ResponseEntity<?> getPatientStats() {
        try {
            Integer patientId = getCurrentUserId();
            PatientAppointmentStats stats = appointmentService.getPatientStats(patientId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Get doctor appointment statistics
    @GetMapping("/doctor/stats")
    public ResponseEntity<?> getDoctorStats() {
        try {
            Integer doctorId = getCurrentUserId();
            DoctorAppointmentStats stats = appointmentService.getDoctorStats(doctorId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Request/Response DTOs
    static class CancelRequest {
        private String reason;
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
    
    static class RescheduleRequest {
        private LocalDate newDate;
        private LocalTime newTime;
        public LocalDate getNewDate() { return newDate; }
        public void setNewDate(LocalDate newDate) { this.newDate = newDate; }
        public LocalTime getNewTime() { return newTime; }
        public void setNewTime(LocalTime newTime) { this.newTime = newTime; }
    }
    
    static class PrescriptionRequest {
        private String prescription;
        private String diagnosis;
        public String getPrescription() { return prescription; }
        public void setPrescription(String prescription) { this.prescription = prescription; }
        public String getDiagnosis() { return diagnosis; }
        public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
    }
    
    static class AvailabilityResponse {
        private boolean available;
        public AvailabilityResponse(boolean available) { this.available = available; }
        public boolean isAvailable() { return available; }
    }
    
    static class ErrorResponse {
        private String error;
        private long timestamp;
        public ErrorResponse(String message) {
            this.error = message;
            this.timestamp = System.currentTimeMillis();
        }
        public String getError() { return error; }
        public long getTimestamp() { return timestamp; }
    }
}
