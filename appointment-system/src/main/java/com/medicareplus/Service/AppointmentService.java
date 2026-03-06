package com.medicareplus.Service;

import com.medicareplus.Models.Appointment;
import com.medicareplus.Models.AppointmentStatus;
import com.medicareplus.Models.UserRole;
import com.medicareplus.DTO.AppointmentRequestDTO;
import com.medicareplus.DTO.AppointmentResponseDTO;
import com.medicareplus.DTO.AppointmentUpdateDTO;
import com.medicareplus.DTO.DoctorAppointmentStats;
import com.medicareplus.DTO.DoctorPaymentAnalyticsDTO;
import com.medicareplus.DTO.DoctorReviewDTO;
import com.medicareplus.DTO.DoctorReviewSummaryDTO;
import com.medicareplus.DTO.FeedbackDTO;
import com.medicareplus.DTO.PatientAppointmentStats;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentService {
    
    AppointmentResponseDTO bookAppointment(Integer patientId, AppointmentRequestDTO request);
    
    AppointmentResponseDTO getAppointmentById(Long appointmentId);
    
    List<AppointmentResponseDTO> getPatientAppointments(Integer patientId);
    
    List<AppointmentResponseDTO> getPatientUpcomingAppointments(Integer patientId);
    
    List<AppointmentResponseDTO> getPatientPastAppointments(Integer patientId);
    
    List<AppointmentResponseDTO> getDoctorAppointments(Integer doctorId);
    
    List<AppointmentResponseDTO> getDoctorUpcomingAppointments(Integer doctorId);
    
    List<AppointmentResponseDTO> getDoctorPastAppointments(Integer doctorId);
    
    List<AppointmentResponseDTO> getDoctorTodayAppointments(Integer doctorId);
    
    AppointmentResponseDTO cancelAppointment(Integer actorUserId, UserRole actorRole, Long appointmentId, String cancellationReason);
    
    AppointmentResponseDTO rescheduleAppointment(Long appointmentId, LocalDate newDate, LocalTime newTime);
    
    AppointmentResponseDTO confirmAppointment(Integer doctorId, Long appointmentId);
    
    AppointmentResponseDTO completeAppointment(Integer doctorId, Long appointmentId);
    
    // AppointmentResponseDTO addPrescription(Long appointmentId, String prescription, String diagnosis);
    
    AppointmentResponseDTO addFeedback(Integer actorUserId, UserRole actorRole, Long appointmentId, FeedbackDTO feedback);

    List<DoctorReviewDTO> getDoctorReviews(Integer doctorId);

    DoctorReviewSummaryDTO getDoctorReviewSummary(Integer doctorId);
    
    boolean isTimeSlotAvailable(Integer doctorId, LocalDate date, LocalTime time);
    
    List<LocalTime> getAvailableTimeSlots(Integer doctorId, LocalDate date);
    
    PatientAppointmentStats getPatientStats(Integer patientId);
    
    DoctorAppointmentStats getDoctorStats(Integer doctorId);

    DoctorPaymentAnalyticsDTO getDoctorPaymentAnalytics(Integer doctorId);
}
