package com.medicareplus.Controller;

import com.medicareplus.Models.Appointment;
import com.medicareplus.Models.PaymentRecord;
import com.medicareplus.Models.User;
import com.medicareplus.Service.AppointmentService;
import com.medicareplus.Service.DoctorAvailabilityService;
import com.medicareplus.Service.UserService;
import com.medicareplus.DTO.AppointmentRequestDTO;
import com.medicareplus.DTO.AppointmentResponseDTO;
import com.medicareplus.DTO.AppointmentUpdateDTO;
import com.medicareplus.DTO.DoctorAppointmentStats;
import com.medicareplus.DTO.DoctorPaymentAnalyticsDTO;
import com.medicareplus.DTO.DoctorReviewDTO;
import com.medicareplus.DTO.DoctorReviewSummaryDTO;
import com.medicareplus.DTO.FeedbackDTO;
import com.medicareplus.DTO.LabAppointmentRequestDTO;
import com.medicareplus.DTO.LabPatientAppointmentDTO;
import com.medicareplus.DTO.PatientAppointmentStats;
import com.medicareplus.Repository.PaymentRecordRepository;
import com.medicareplus.Security.JwtUtil;
import com.medicareplus.Service.LabAppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin("*")
@RequiredArgsConstructor
public class AppointmentController {
    
    private final AppointmentService appointmentService;
    private final DoctorAvailabilityService doctorAvailabilityService;
    private final UserService userService;
    private final PaymentRecordRepository paymentRecordRepository;
    private final JwtUtil jwtUtil;
    private final LabAppointmentService labAppointmentService;
    
    // Helper method to get current user ID from token
    private Integer getCurrentUserId() {
        return resolveCurrentUser().getId();
    }

    private User getCurrentUser() {
        return resolveCurrentUser();
    }

    private User resolveCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        try {
            return userService.getUserByEmail(username);
        } catch (RuntimeException ex) {
            return userService.getUserByPhone(username);
        }
    }
    
    // Book new appointment
    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(@Valid @RequestBody AppointmentRequestDTO request) {
        try {
            Integer patientId = getCurrentUserId();
            AppointmentResponseDTO response = appointmentService.bookAppointment(patientId, request);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/book-lab-appointment")
    public ResponseEntity<?> bookLabAppointment(@RequestBody LabAppointmentRequestDTO request) {
        try {
            Long bookingId = labAppointmentService.bookLabAppointment(request);
            return ResponseEntity.ok(java.util.Map.of(
                    "bookingId", bookingId,
                    "confirmationNumber", "LAB-" + bookingId
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
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

    @GetMapping("/patient/lab")
    public ResponseEntity<?> getPatientLabAppointments() {
        try {
            User currentUser = getCurrentUser();
            Integer patientId = currentUser.getId();
            String patientEmail = currentUser.getEmail();
            List<LabPatientAppointmentDTO> appointments = labAppointmentService.getPatientAppointments(patientId, patientEmail);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/patient/lab/{appointmentId}/cancel")
    public ResponseEntity<?> cancelPatientLabAppointment(@PathVariable Long appointmentId) {
        try {
            User currentUser = getCurrentUser();
            Integer patientId = currentUser.getId();
            String patientEmail = currentUser.getEmail();
            LabPatientAppointmentDTO response = labAppointmentService.cancelPatientAppointment(patientId, patientEmail, appointmentId);
            return ResponseEntity.ok(response);
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
            User actor = getCurrentUser();
            AppointmentResponseDTO response = appointmentService.cancelAppointment(
                    actor.getId(),
                    actor.getRole(),
                    appointmentId,
                    reason
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/{appointmentId}/receipt")
    public ResponseEntity<?> getAppointmentReceipt(@PathVariable Long appointmentId) {
        try {
            AppointmentResponseDTO appointment = appointmentService.getAppointmentById(appointmentId);
            User currentUser = getCurrentUser();

            boolean isAdmin = currentUser.getRole() != null && "ADMIN".equalsIgnoreCase(currentUser.getRole().name());
            boolean isAssignedDoctor = appointment.getDoctorId() != null && appointment.getDoctorId().equals(currentUser.getId());
            boolean isPatient = appointment.getPatientId() != null && appointment.getPatientId().equals(currentUser.getId());

            if (!isAdmin && !isAssignedDoctor && !isPatient) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse("Access denied"));
            }

            PaymentRecord payment = paymentRecordRepository.findByAppointmentId(appointmentId)
                    .orElse(null);
            if (payment == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Receipt not available yet. Complete appointment first."));
            }

            return ResponseEntity.ok(new ReceiptResponse(
                    payment.getId(),
                    appointmentId,
                    payment.getPatientNameSnapshot(),
                    payment.getDoctorNameSnapshot(),
                    payment.getAmount(),
                    payment.getCurrency(),
                    payment.getMethod() != null ? payment.getMethod().name() : null,
                    payment.getStatus() != null ? payment.getStatus().name() : null,
                    payment.getTransactionReference(),
                    payment.getAppointmentDateSnapshot() != null ? payment.getAppointmentDateSnapshot().toString() : null,
                    payment.getAppointmentTimeSnapshot() != null ? payment.getAppointmentTimeSnapshot().toString() : null,
                    payment.getPaidAt() != null ? payment.getPaidAt().toString() : null,
                    payment.getVisitTypeSnapshot(),
                    payment.getNotes()
            ));
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
            Integer doctorId = getCurrentUserId();
            AppointmentResponseDTO response = appointmentService.confirmAppointment(doctorId, appointmentId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Complete appointment (doctor only)
    @PutMapping("/{appointmentId}/complete")
    public ResponseEntity<?> completeAppointment(@PathVariable Long appointmentId) {
        try {
            Integer doctorId = getCurrentUserId();
            AppointmentResponseDTO response = appointmentService.completeAppointment(doctorId, appointmentId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Add prescription to appointment
    // @PostMapping("/{appointmentId}/prescription")
    // public ResponseEntity<?> addPrescription(
    //         @PathVariable Long appointmentId,
    //         @RequestBody PrescriptionRequest request) {
    //     try {
    //         AppointmentResponseDTO response = appointmentService.addPrescription(
    //                 appointmentId, request.getPrescription(), request.getDiagnosis());
    //         return ResponseEntity.ok(response);
    //     } catch (Exception e) {
    //         return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    //     }
    // }
    
    // Add feedback to appointment
    @PostMapping("/{appointmentId}/feedback")
    public ResponseEntity<?> addFeedback(
            @PathVariable Long appointmentId,
            @RequestBody FeedbackDTO feedback) {
        try {
            User actor = getCurrentUser();
            AppointmentResponseDTO response = appointmentService.addFeedback(
                    actor.getId(),
                    actor.getRole(),
                    appointmentId,
                    feedback
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/doctors/{doctorId}/reviews")
    public ResponseEntity<?> getDoctorReviews(@PathVariable Integer doctorId) {
        try {
            List<DoctorReviewDTO> reviews = appointmentService.getDoctorReviews(doctorId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/doctors/{doctorId}/reviews/summary")
    public ResponseEntity<?> getDoctorReviewSummary(@PathVariable Integer doctorId) {
        try {
            DoctorReviewSummaryDTO summary = appointmentService.getDoctorReviewSummary(doctorId);
            return ResponseEntity.ok(summary);
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

    @GetMapping("/available-dates")
    public ResponseEntity<?> getAvailableDates(
            @RequestParam Integer doctorId,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(defaultValue = "30") Integer days) {
        try {
            LocalDate start = fromDate != null ? fromDate : LocalDate.now();
            int safeDays = Math.max(1, Math.min(days, 90));
            List<LocalDate> availableDates = doctorAvailabilityService.getAvailableDatesForDoctor(doctorId, start, safeDays);
            return ResponseEntity.ok(availableDates);
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

    // Get doctor payment analytics
    @GetMapping("/doctor/payments/analytics")
    public ResponseEntity<?> getDoctorPaymentAnalytics() {
        try {
            Integer doctorId = getCurrentUserId();
            DoctorPaymentAnalyticsDTO analytics = appointmentService.getDoctorPaymentAnalytics(doctorId);
            return ResponseEntity.ok(analytics);
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

    static class ReceiptResponse {
        private Long receiptId;
        private Long appointmentId;
        private String patientName;
        private String doctorName;
        private Double amount;
        private String currency;
        private String method;
        private String status;
        private String transactionReference;
        private String appointmentDate;
        private String appointmentTime;
        private String paidAt;
        private String visitType;
        private String notes;

        public ReceiptResponse(Long receiptId, Long appointmentId, String patientName, String doctorName, Double amount,
                               String currency, String method, String status, String transactionReference,
                               String appointmentDate, String appointmentTime, String paidAt, String visitType,
                               String notes) {
            this.receiptId = receiptId;
            this.appointmentId = appointmentId;
            this.patientName = patientName;
            this.doctorName = doctorName;
            this.amount = amount;
            this.currency = currency;
            this.method = method;
            this.status = status;
            this.transactionReference = transactionReference;
            this.appointmentDate = appointmentDate;
            this.appointmentTime = appointmentTime;
            this.paidAt = paidAt;
            this.visitType = visitType;
            this.notes = notes;
        }

        public Long getReceiptId() { return receiptId; }
        public Long getAppointmentId() { return appointmentId; }
        public String getPatientName() { return patientName; }
        public String getDoctorName() { return doctorName; }
        public Double getAmount() { return amount; }
        public String getCurrency() { return currency; }
        public String getMethod() { return method; }
        public String getStatus() { return status; }
        public String getTransactionReference() { return transactionReference; }
        public String getAppointmentDate() { return appointmentDate; }
        public String getAppointmentTime() { return appointmentTime; }
        public String getPaidAt() { return paidAt; }
        public String getVisitType() { return visitType; }
        public String getNotes() { return notes; }
    }
}
