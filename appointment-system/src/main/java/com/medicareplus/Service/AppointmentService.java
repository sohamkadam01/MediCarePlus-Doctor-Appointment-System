package com.medicareplus.Service;

import com.medicareplus.Models.Appointment;
import com.medicareplus.Models.AppointmentStatus;
import com.medicareplus.DTO.AppointmentRequestDTO;
import com.medicareplus.DTO.AppointmentResponseDTO;
import com.medicareplus.DTO.AppointmentUpdateDTO;
import com.medicareplus.DTO.DoctorAppointmentStats;
import com.medicareplus.DTO.FeedbackDTO;
import com.medicareplus.DTO.PatientAppointmentStats;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentService {
    
    // Book new appointment
    AppointmentResponseDTO bookAppointment(Integer patientId, AppointmentRequestDTO request);
    
    // Get appointment by ID
    AppointmentResponseDTO getAppointmentById(Long appointmentId);
    
    // Get all appointments for patient
    List<AppointmentResponseDTO> getPatientAppointments(Integer patientId);
    
    // Get upcoming appointments for patient
    List<AppointmentResponseDTO> getPatientUpcomingAppointments(Integer patientId);
    
    // Get past appointments for patient
    List<AppointmentResponseDTO> getPatientPastAppointments(Integer patientId);
    
    // Get all appointments for doctor
    List<AppointmentResponseDTO> getDoctorAppointments(Integer doctorId);
    
    // Get upcoming appointments for doctor
    List<AppointmentResponseDTO> getDoctorUpcomingAppointments(Integer doctorId);
    
    // Get past appointments for doctor
    List<AppointmentResponseDTO> getDoctorPastAppointments(Integer doctorId);
    
    // Get today's appointments for doctor
    List<AppointmentResponseDTO> getDoctorTodayAppointments(Integer doctorId);
    
    // Cancel appointment
    AppointmentResponseDTO cancelAppointment(Long appointmentId, String cancellationReason);
    
    // Reschedule appointment
    AppointmentResponseDTO rescheduleAppointment(Long appointmentId, LocalDate newDate, LocalTime newTime);
    
    // Confirm appointment (by doctor)
    AppointmentResponseDTO confirmAppointment(Long appointmentId);
    
    // Complete appointment (by doctor)
    AppointmentResponseDTO completeAppointment(Long appointmentId);
    
    // Add prescription to appointment
    AppointmentResponseDTO addPrescription(Long appointmentId, String prescription, String diagnosis);
    
    // Add feedback to appointment
    AppointmentResponseDTO addFeedback(Long appointmentId, FeedbackDTO feedback);
    
    // Check if time slot is available
    boolean isTimeSlotAvailable(Integer doctorId, LocalDate date, LocalTime time);
    
    // Get available time slots for doctor on a date
    List<LocalTime> getAvailableTimeSlots(Integer doctorId, LocalDate date);
    
    // Get appointment statistics for patient
    PatientAppointmentStats getPatientStats(Integer patientId);
    
    // Get appointment statistics for doctor
    DoctorAppointmentStats getDoctorStats(Integer doctorId);
}
