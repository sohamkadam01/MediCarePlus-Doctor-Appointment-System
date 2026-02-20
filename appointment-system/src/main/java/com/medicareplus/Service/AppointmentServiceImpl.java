package com.medicareplus.Service;

import com.medicareplus.Models.Appointment;
import com.medicareplus.Models.AppointmentStatus;
import com.medicareplus.Models.DoctorDetails;
import com.medicareplus.Models.User;
import com.medicareplus.Models.UserRole;
import com.medicareplus.Repository.AppointmentRepository;
import com.medicareplus.Repository.UserRepository;
import com.medicareplus.Repository.DoctorDetailsRepository;
import com.medicareplus.DTO.AppointmentRequestDTO;
import com.medicareplus.DTO.AppointmentResponseDTO;
import com.medicareplus.DTO.DoctorAppointmentStats;
import com.medicareplus.DTO.FeedbackDTO;
import com.medicareplus.DTO.PatientAppointmentStats;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentServiceImpl implements AppointmentService {
    
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final DoctorDetailsRepository doctorDetailsRepository;
    
    @Override
    public AppointmentResponseDTO bookAppointment(Integer patientId, AppointmentRequestDTO request) {
        // Validate patient
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));
        
        if (patient.getRole() != UserRole.PATIENT) {
            throw new IllegalArgumentException("User is not a patient");
        }
        
        // Validate doctor
        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + request.getDoctorId()));
        
        if (doctor.getRole() != UserRole.DOCTOR) {
            throw new IllegalArgumentException("User is not a doctor");
        }
        
        // Check if doctor is approved
        DoctorDetails doctorDetails = doctorDetailsRepository.findByUserId(doctor.getId())
                .orElseThrow(() -> new RuntimeException("Doctor details not found"));
        
        if (!doctorDetails.isApproved()) {
            throw new IllegalArgumentException("Doctor is not approved yet");
        }
        
        // Validate date and time
        if (request.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot book appointment for past date");
        }
        
        // Check if slot is available
        if (!isTimeSlotAvailable(doctor.getId(), request.getAppointmentDate(), request.getAppointmentTime())) {
            throw new IllegalArgumentException("Selected time slot is not available");
        }
        
        // Create appointment
        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .reason(request.getReason())
                .symptoms(request.getSymptoms())
                .consultationFee(doctorDetails.getConsultationFee() != null
                        ? doctorDetails.getConsultationFee().doubleValue()
                        : null)
                .status(AppointmentStatus.PENDING)
                .build();
        
        Appointment savedAppointment = appointmentRepository.save(appointment);
        
        return mapToResponseDTO(savedAppointment);
    }
    
    @Override
    public AppointmentResponseDTO getAppointmentById(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + appointmentId));
        
        return mapToResponseDTO(appointment);
    }
    
    @Override
    public List<AppointmentResponseDTO> getPatientAppointments(Integer patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        return appointmentRepository.findByPatientOrderByAppointmentDateDescAppointmentTimeDesc(patient)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<AppointmentResponseDTO> getPatientUpcomingAppointments(Integer patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        return appointmentRepository.findUpcomingByPatient(patient)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<AppointmentResponseDTO> getPatientPastAppointments(Integer patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        return appointmentRepository.findPastByPatient(patient)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<AppointmentResponseDTO> getDoctorAppointments(Integer doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        return appointmentRepository.findByDoctorOrderByAppointmentDateDescAppointmentTimeDesc(doctor)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<AppointmentResponseDTO> getDoctorUpcomingAppointments(Integer doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        return appointmentRepository.findUpcomingByDoctor(doctor)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<AppointmentResponseDTO> getDoctorPastAppointments(Integer doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        return appointmentRepository.findPastByDoctor(doctor)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<AppointmentResponseDTO> getDoctorTodayAppointments(Integer doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        return appointmentRepository.findTodayByDoctor(doctor)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public AppointmentResponseDTO cancelAppointment(Long appointmentId, String cancellationReason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new IllegalArgumentException("Cannot cancel completed appointment");
        }
        
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new IllegalArgumentException("Appointment is already cancelled");
        }
        
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(cancellationReason);
        appointment.setCancelledAt(LocalDateTime.now());
        
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        
        return mapToResponseDTO(updatedAppointment);
    }
    
    @Override
    public AppointmentResponseDTO rescheduleAppointment(Long appointmentId, LocalDate newDate, LocalTime newTime) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new IllegalArgumentException("Cannot reschedule completed appointment");
        }
        
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot reschedule cancelled appointment");
        }
        
        // Check if new slot is available
        if (!isTimeSlotAvailable(appointment.getDoctor().getId(), newDate, newTime)) {
            throw new IllegalArgumentException("Selected time slot is not available");
        }
        
        appointment.setAppointmentDate(newDate);
        appointment.setAppointmentTime(newTime);
        appointment.setStatus(AppointmentStatus.RESCHEDULED);
        
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        
        return mapToResponseDTO(updatedAppointment);
    }
    
    @Override
    public AppointmentResponseDTO confirmAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new IllegalArgumentException("Only pending appointments can be confirmed");
        }
        
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        
        return mapToResponseDTO(updatedAppointment);
    }
    
    @Override
    public AppointmentResponseDTO completeAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new IllegalArgumentException("Only confirmed appointments can be completed");
        }
        
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment.setCompletedAt(LocalDateTime.now());
        
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        
        return mapToResponseDTO(updatedAppointment);
    }
    
    @Override
    public AppointmentResponseDTO addPrescription(Long appointmentId, String prescription, String diagnosis) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        appointment.setPrescription(prescription);
        appointment.setDiagnosis(diagnosis);
        
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        
        return mapToResponseDTO(updatedAppointment);
    }
    
    @Override
    public AppointmentResponseDTO addFeedback(Long appointmentId, FeedbackDTO feedback) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw new IllegalArgumentException("Feedback can only be added to completed appointments");
        }
        
        appointment.setRating(feedback.getRating());
        appointment.setFeedback(feedback.getFeedback());
        
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        
        return mapToResponseDTO(updatedAppointment);
    }
    
    @Override
    public boolean isTimeSlotAvailable(Integer doctorId, LocalDate date, LocalTime time) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        long count = appointmentRepository.countByDoctorAndDateTime(doctor, date, time);
        return count == 0;
    }
    
    @Override
    public List<LocalTime> getAvailableTimeSlots(Integer doctorId, LocalDate date) {
        // Define standard time slots (9 AM to 5 PM, 30-min intervals)
        List<LocalTime> allSlots = List.of(
            LocalTime.of(9, 0), LocalTime.of(9, 30),
            LocalTime.of(10, 0), LocalTime.of(10, 30),
            LocalTime.of(11, 0), LocalTime.of(11, 30),
            LocalTime.of(14, 0), LocalTime.of(14, 30),
            LocalTime.of(15, 0), LocalTime.of(15, 30),
            LocalTime.of(16, 0), LocalTime.of(16, 30)
        );
        
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        // Get booked slots
        List<Appointment> bookedAppointments = appointmentRepository
                .findByDoctorAndAppointmentDateOrderByAppointmentTimeAsc(doctor, date);
        
        List<LocalTime> bookedTimes = bookedAppointments.stream()
                .filter(a -> a.getStatus() != AppointmentStatus.CANCELLED)
                .map(Appointment::getAppointmentTime)
                .collect(Collectors.toList());
        
        // Return available slots
        return allSlots.stream()
                .filter(slot -> !bookedTimes.contains(slot))
                .collect(Collectors.toList());
    }
    
    @Override
    public PatientAppointmentStats getPatientStats(Integer patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        long total = appointmentRepository.countByPatientAndStatus(patient, null); // Need custom query
        long upcoming = appointmentRepository.findUpcomingByPatient(patient).size();
        long completed = appointmentRepository.countByPatientAndStatus(patient, AppointmentStatus.COMPLETED);
        long cancelled = appointmentRepository.countByPatientAndStatus(patient, AppointmentStatus.CANCELLED);
        
        return new PatientAppointmentStats(total, upcoming, completed, cancelled);
    }
    
    @Override
    public DoctorAppointmentStats getDoctorStats(Integer doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        long total = appointmentRepository.countByDoctorAndStatus(doctor, null);
        long today = appointmentRepository.findTodayByDoctor(doctor).size();
        long upcoming = appointmentRepository.findUpcomingByDoctor(doctor).size();
        long completed = appointmentRepository.countByDoctorAndStatus(doctor, AppointmentStatus.COMPLETED);
        
        // Calculate total revenue
        List<Appointment> paidAppointments = appointmentRepository
                .findByDoctorAndStatus(doctor, AppointmentStatus.COMPLETED); // Need custom query
        
        double totalRevenue = paidAppointments.stream()
                .mapToDouble(a -> a.getConsultationFee() != null ? a.getConsultationFee() : 0.0)
                .sum();
        
        return new DoctorAppointmentStats(total, today, upcoming, completed, totalRevenue);
    }
    
    private AppointmentResponseDTO mapToResponseDTO(Appointment appointment) {
        return AppointmentResponseDTO.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatient().getId())
                .patientName(appointment.getPatient().getName())
                .doctorId(appointment.getDoctor().getId())
                .doctorName(appointment.getDoctor().getName())
                .specialization(appointment.getDoctor().getDoctorDetails() != null ? 
                        appointment.getDoctor().getDoctorDetails().getSpecializationName() : null)
                .appointmentDate(appointment.getAppointmentDate())
                .appointmentTime(appointment.getAppointmentTime())
                .endTime(appointment.getEndTime())
                .status(appointment.getStatus())
                .reason(appointment.getReason())
                .symptoms(appointment.getSymptoms())
                .consultationFee(appointment.getConsultationFee())
                .prescription(appointment.getPrescription())
                .diagnosis(appointment.getDiagnosis())
                .followUpDate(appointment.getFollowUpDate())
                .videoLink(appointment.getVideoLink())
                .meetingId(appointment.getMeetingId())
                .rating(appointment.getRating())
                .feedback(appointment.getFeedback())
                .createdAt(appointment.getCreatedAt())
                .cancellationReason(appointment.getCancellationReason())
                .build();
    }
}

