package com.medicareplus.Service;

import com.medicareplus.Models.Appointment;
import com.medicareplus.Models.AppointmentStatus;
import com.medicareplus.Models.BookingSource;
import com.medicareplus.Models.DoctorDetails;
import com.medicareplus.Models.PaymentMethod;
import com.medicareplus.Models.PaymentRecord;
import com.medicareplus.Models.PaymentStatus;
import com.medicareplus.Models.PatientDetails;
import com.medicareplus.Models.User;
import com.medicareplus.Models.UserRole;
import com.medicareplus.Models.UserStatus;
import com.medicareplus.Repository.AppointmentRepository;
import com.medicareplus.Repository.PaymentRecordRepository;
import com.medicareplus.Repository.UserRepository;
import com.medicareplus.Repository.DoctorDetailsRepository;
import com.medicareplus.Repository.PatientDetailsRepository;
import com.medicareplus.DTO.AppointmentRequestDTO;
import com.medicareplus.DTO.AppointmentResponseDTO;
import com.medicareplus.DTO.DoctorAppointmentStats;
import com.medicareplus.DTO.DoctorPaymentAnalyticsDTO;
import com.medicareplus.DTO.DoctorReviewDTO;
import com.medicareplus.DTO.DoctorReviewSummaryDTO;
import com.medicareplus.DTO.FeedbackDTO;
import com.medicareplus.DTO.PatientAppointmentStats;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentServiceImpl implements AppointmentService {
    
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final DoctorDetailsRepository doctorDetailsRepository;
    private final PatientDetailsRepository patientDetailsRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final DoctorAvailabilityService doctorAvailabilityService;
    private final AdminActivityService adminActivityService;
    
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
            // Backfill legacy data: if doctor user is ACTIVE but details were never marked approved.
            if (doctor.getStatus() == UserStatus.ACTIVE) {
                doctorDetails.setApproved(true);
                doctorDetails = doctorDetailsRepository.save(doctorDetails);
            } else {
                throw new IllegalArgumentException("Doctor is not approved yet");
            }
        }
        
        // Validate date and time
        if (request.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot book appointment for past date");
        }
        
        // Check if slot is available
        if (!isTimeSlotAvailable(doctor.getId(), request.getAppointmentDate(), request.getAppointmentTime())) {
            throw new IllegalArgumentException("Selected time slot is not available");
        }

        // Reserve configured availability slot when doctor schedule exists for this date/time.
        doctorAvailabilityService.markSlotBookedIfExists(
                doctor.getId(),
                request.getAppointmentDate(),
                request.getAppointmentTime()
        );

        BookingSource bookingSource = request.getBookingSource() != null
                ? request.getBookingSource()
                : BookingSource.NEW;

        Long parentAppointmentId = request.getParentAppointmentId();
        if (bookingSource == BookingSource.REBOOK) {
            if (parentAppointmentId == null) {
                throw new IllegalArgumentException("Parent appointment ID is required for rebook");
            }
            Appointment parent = appointmentRepository.findById(parentAppointmentId)
                    .orElseThrow(() -> new RuntimeException("Parent appointment not found"));
            if (!parent.getPatient().getId().equals(patientId)) {
                throw new IllegalArgumentException("Parent appointment does not belong to current patient");
            }
            if (!parent.getDoctor().getId().equals(doctor.getId())) {
                throw new IllegalArgumentException("Rebook doctor must match parent appointment doctor");
            }
        }

        PatientDetails patientDetails = patientDetailsRepository.findByUserId(patientId).orElse(null);
        
        // Create appointment
        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .reason(request.getReason())
                .symptoms(request.getSymptoms())
                .notes(request.getNotes())
                .durationOfSymptoms(request.getDurationOfSymptoms())
                .severity(request.getSeverity())
                .visitType(request.getVisitType())
                .bookingSource(bookingSource)
                .parentAppointmentId(parentAppointmentId)
                .patientSnapshotName(patient.getName())
                .patientSnapshotAge(patientDetails != null ? patientDetails.getAge() : null)
                .patientSnapshotGender(patientDetails != null ? patientDetails.getGender() : null)
                .patientSnapshotBloodGroup(patientDetails != null ? patientDetails.getBloodGroup() : null)
                .patientSnapshotAllergies(patientDetails != null ? patientDetails.getAllergies() : null)
                .patientSnapshotEmergencyContactName(
                        patientDetails != null ? patientDetails.getEmergencyContactName() : null
                )
                .patientSnapshotEmergencyContactPhone(
                        patientDetails != null ? patientDetails.getEmergencyContactPhone() : null
                )
                .consultationFee(doctorDetails.getConsultationFee() != null
                        ? doctorDetails.getConsultationFee().doubleValue()
                        : null)
                .status(AppointmentStatus.PENDING)
                .build();
        
        Appointment savedAppointment = appointmentRepository.save(appointment);
        createOrUpdateBookingReceipt(savedAppointment);
        adminActivityService.log(
                "APPOINTMENT_BOOKED",
                "Appointment booked by " + patient.getName() + " with Dr. " + doctor.getName(),
                patient.getRole().name(),
                patient.getId(),
                patient.getName(),
                "APPOINTMENT",
                savedAppointment.getId()
        );
        
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
    public AppointmentResponseDTO cancelAppointment(Integer actorUserId, UserRole actorRole, Long appointmentId, String cancellationReason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (actorRole == null || actorUserId == null) {
            throw new IllegalArgumentException("Invalid user context for cancellation");
        }

        boolean isAdmin = actorRole == UserRole.ADMIN;
        boolean isPatientOwner = appointment.getPatient() != null && appointment.getPatient().getId().equals(actorUserId);
        boolean isDoctorOwner = appointment.getDoctor() != null && appointment.getDoctor().getId().equals(actorUserId);
        if (!isAdmin && !isPatientOwner && !isDoctorOwner) {
            throw new IllegalArgumentException("You are not authorized to cancel this appointment");
        }
        
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
        adminActivityService.log(
                "APPOINTMENT_CANCELLED",
                "Appointment cancelled: " + appointment.getPatient().getName() + " with Dr. " + appointment.getDoctor().getName(),
                "SYSTEM",
                null,
                null,
                "APPOINTMENT",
                updatedAppointment.getId()
        );
        
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
        adminActivityService.log(
                "APPOINTMENT_RESCHEDULED",
                "Appointment rescheduled for " + appointment.getPatient().getName() + " with Dr. " + appointment.getDoctor().getName(),
                "SYSTEM",
                null,
                null,
                "APPOINTMENT",
                updatedAppointment.getId()
        );
        
        return mapToResponseDTO(updatedAppointment);
    }
    
    @Override
    public AppointmentResponseDTO confirmAppointment(Integer doctorId, Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (doctorId == null || appointment.getDoctor() == null || !appointment.getDoctor().getId().equals(doctorId)) {
            throw new IllegalArgumentException("You are not authorized to confirm this appointment");
        }
        
        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new IllegalArgumentException("Only pending appointments can be confirmed");
        }
        
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        adminActivityService.log(
                "APPOINTMENT_CONFIRMED",
                "Appointment confirmed: " + appointment.getPatient().getName() + " with Dr. " + appointment.getDoctor().getName(),
                appointment.getDoctor().getRole().name(),
                appointment.getDoctor().getId(),
                appointment.getDoctor().getName(),
                "APPOINTMENT",
                updatedAppointment.getId()
        );
        
        return mapToResponseDTO(updatedAppointment);
    }
    
    @Override
    public AppointmentResponseDTO completeAppointment(Integer doctorId, Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointment.getDoctor() == null || !appointment.getDoctor().getId().equals(doctorId)) {
            throw new IllegalArgumentException("You are not authorized to complete this appointment");
        }
        
        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new IllegalArgumentException("Only confirmed appointments can be completed");
        }
        
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment.setCompletedAt(LocalDateTime.now());
        
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        createPaymentRecordForCompletedAppointment(updatedAppointment);
        adminActivityService.log(
                "APPOINTMENT_COMPLETED",
                "Appointment completed: " + appointment.getPatient().getName() + " with Dr. " + appointment.getDoctor().getName()
                        + " (Fee: " + (appointment.getConsultationFee() != null ? appointment.getConsultationFee() : 0.0) + ")",
                appointment.getDoctor().getRole().name(),
                appointment.getDoctor().getId(),
                appointment.getDoctor().getName(),
                "APPOINTMENT",
                updatedAppointment.getId()
        );
        
        return mapToResponseDTO(updatedAppointment);
    }

    public void createPaymentRecordForCompletedAppointment(Appointment appointment) {
        if (appointment == null || appointment.getId() == null) return;

        double amount = appointment.getConsultationFee() != null ? appointment.getConsultationFee() : 0.0;
        LocalDateTime paidAt = appointment.getCompletedAt() != null ? appointment.getCompletedAt() : LocalDateTime.now();

        PaymentRecord paymentRecord = paymentRecordRepository.findByAppointmentId(appointment.getId())
                .orElseGet(() -> PaymentRecord.builder()
                        .appointment(appointment)
                        .doctor(appointment.getDoctor())
                        .patient(appointment.getPatient())
                        .currency("INR")
                        .build());

        paymentRecord.setAppointment(appointment);
        paymentRecord.setDoctor(appointment.getDoctor());
        paymentRecord.setPatient(appointment.getPatient());
        paymentRecord.setAmount(amount);
        paymentRecord.setCurrency("INR");
        paymentRecord.setStatus(PaymentStatus.PAID);
        paymentRecord.setMethod(paymentRecord.getMethod() != null ? paymentRecord.getMethod() : PaymentMethod.CASH);
        paymentRecord.setAppointmentDateSnapshot(appointment.getAppointmentDate());
        paymentRecord.setAppointmentTimeSnapshot(appointment.getAppointmentTime());
        paymentRecord.setDoctorNameSnapshot(appointment.getDoctor() != null ? appointment.getDoctor().getName() : "Doctor");
        paymentRecord.setPatientNameSnapshot(appointment.getPatient() != null ? appointment.getPatient().getName() : "Patient");
        paymentRecord.setVisitTypeSnapshot(appointment.getVisitType());
        paymentRecord.setPaidAt(paidAt);
        paymentRecord.setNotes("Updated on appointment completion");

        paymentRecordRepository.save(paymentRecord);
    }

    private void createOrUpdateBookingReceipt(Appointment appointment) {
        if (appointment == null || appointment.getId() == null) return;

        double amount = appointment.getConsultationFee() != null ? appointment.getConsultationFee() : 0.0;
        PaymentRecord paymentRecord = paymentRecordRepository.findByAppointmentId(appointment.getId())
                .orElseGet(() -> PaymentRecord.builder()
                        .appointment(appointment)
                        .doctor(appointment.getDoctor())
                        .patient(appointment.getPatient())
                        .currency("INR")
                        .build());

        paymentRecord.setAppointment(appointment);
        paymentRecord.setDoctor(appointment.getDoctor());
        paymentRecord.setPatient(appointment.getPatient());
        paymentRecord.setAmount(amount);
        paymentRecord.setCurrency("INR");
        if (paymentRecord.getStatus() == null) {
            paymentRecord.setStatus(PaymentStatus.PENDING);
        }
        paymentRecord.setMethod(paymentRecord.getMethod() != null ? paymentRecord.getMethod() : PaymentMethod.ONLINE);
        paymentRecord.setAppointmentDateSnapshot(appointment.getAppointmentDate());
        paymentRecord.setAppointmentTimeSnapshot(appointment.getAppointmentTime());
        paymentRecord.setDoctorNameSnapshot(appointment.getDoctor() != null ? appointment.getDoctor().getName() : "Doctor");
        paymentRecord.setPatientNameSnapshot(appointment.getPatient() != null ? appointment.getPatient().getName() : "Patient");
        paymentRecord.setVisitTypeSnapshot(appointment.getVisitType());
        paymentRecord.setNotes("Generated at booking");

        paymentRecordRepository.save(paymentRecord);
    }
    
    // @Override
    // public AppointmentResponseDTO addPrescription(Long appointmentId, String prescription, String diagnosis) {
    //     Appointment appointment = appointmentRepository.findById(appointmentId)
    //             .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
    //     appointment.setPrescription(prescription);
    //     appointment.setDiagnosis(diagnosis);
        
    //     Appointment updatedAppointment = appointmentRepository.save(appointment);
        
    //     return mapToResponseDTO(updatedAppointment);
    // }
    
    @Override
    public AppointmentResponseDTO addFeedback(Integer actorUserId, UserRole actorRole, Long appointmentId, FeedbackDTO feedback) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (actorRole != UserRole.PATIENT) {
            throw new IllegalArgumentException("Only patients can add a doctor review");
        }
        if (actorUserId == null || appointment.getPatient() == null ||
                !appointment.getPatient().getId().equals(actorUserId)) {
            throw new IllegalArgumentException("You are not authorized to review this appointment");
        }
        
        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw new IllegalArgumentException("Feedback can only be added to completed appointments");
        }

        if (appointment.getRating() != null ||
                (appointment.getFeedback() != null && !appointment.getFeedback().trim().isEmpty())) {
            throw new IllegalArgumentException("Review already submitted for this appointment");
        }

        if (feedback == null || feedback.getRating() == null) {
            throw new IllegalArgumentException("Rating is required");
        }
        if (feedback.getRating() < 1 || feedback.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        
        appointment.setRating(feedback.getRating());
        appointment.setFeedback(
                feedback.getFeedback() != null && !feedback.getFeedback().trim().isEmpty()
                        ? feedback.getFeedback().trim()
                        : null
        );
        
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        
        return mapToResponseDTO(updatedAppointment);
    }

    @Override
    public List<DoctorReviewDTO> getDoctorReviews(Integer doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        if (doctor.getRole() != UserRole.DOCTOR) {
            throw new IllegalArgumentException("User is not a doctor");
        }

        return appointmentRepository.findCompletedReviewsByDoctor(doctor).stream()
                .map(this::mapToDoctorReviewDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DoctorReviewSummaryDTO getDoctorReviewSummary(Integer doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        if (doctor.getRole() != UserRole.DOCTOR) {
            throw new IllegalArgumentException("User is not a doctor");
        }

        Double average = appointmentRepository.getAverageRatingByDoctor(doctor);
        long total = appointmentRepository.countCompletedRatingsByDoctor(doctor);
        double safeAverage = average != null ? Math.round(average * 100.0) / 100.0 : 0.0;

        return DoctorReviewSummaryDTO.builder()
                .doctorId(doctorId)
                .averageRating(safeAverage)
                .totalReviews(total)
                .build();
    }
    
    @Override
    public boolean isTimeSlotAvailable(Integer doctorId, LocalDate date, LocalTime time) {
        return getAvailableTimeSlots(doctorId, date).contains(time);
    }
    
    @Override
    public List<LocalTime> getAvailableTimeSlots(Integer doctorId, LocalDate date) {
        final int slotMinutes = 30;

        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        List<LocalTime> allSlots = doctorAvailabilityService.getAvailableSlotsForDate(doctorId, date);
        if (allSlots.isEmpty()) {
            if (doctorAvailabilityService.hasConfiguredAvailability(doctorId)) {
                return List.of();
            }

            DoctorDetails doctorDetails = doctorDetailsRepository.findByUserId(doctorId)
                    .orElseThrow(() -> new RuntimeException("Doctor details not found"));

            LocalTime start = doctorDetails.getAvailabilityStartTime();
            LocalTime end = doctorDetails.getAvailabilityEndTime();

            // Backward compatibility for existing doctors with no configured schedule yet.
            if (start == null || end == null) {
                allSlots = new java.util.ArrayList<>(List.of(
                    LocalTime.of(9, 0), LocalTime.of(9, 30),
                    LocalTime.of(10, 0), LocalTime.of(10, 30),
                    LocalTime.of(11, 0), LocalTime.of(11, 30),
                    LocalTime.of(14, 0), LocalTime.of(14, 30),
                    LocalTime.of(15, 0), LocalTime.of(15, 30),
                    LocalTime.of(16, 0), LocalTime.of(16, 30)
                ));
            } else if (start.isBefore(end)) {
                allSlots = new java.util.ArrayList<>();
                LocalTime slot = start;
                while (slot.isBefore(end)) {
                    allSlots.add(slot);
                    slot = slot.plusMinutes(slotMinutes);
                }
            } else {
                return List.of();
            }
        }
        
        // Get booked slots
        List<Appointment> bookedAppointments = appointmentRepository
                .findByDoctorAndAppointmentDateOrderByAppointmentTimeAsc(doctor, date);
        
        List<LocalTime> bookedTimes = bookedAppointments.stream()
                .filter(a -> a.getStatus() != AppointmentStatus.CANCELLED)
                .map(Appointment::getAppointmentTime)
                .collect(Collectors.toList());
        
        // Return available slots; for today, hide past time slots.
        final LocalDate today = LocalDate.now();
        final LocalTime now = LocalTime.now();
        return allSlots.stream()
                .filter(slot -> !bookedTimes.contains(slot))
                .filter(slot -> !date.equals(today) || slot.isAfter(now))
                .collect(Collectors.toList());
    }
    
    @Override
    public PatientAppointmentStats getPatientStats(Integer patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        long total = appointmentRepository.countByPatient(patient);
        long upcoming = appointmentRepository.findUpcomingByPatient(patient).size();
        long completed = appointmentRepository.countByPatientAndStatus(patient, AppointmentStatus.COMPLETED);
        long cancelled = appointmentRepository.countByPatientAndStatus(patient, AppointmentStatus.CANCELLED);
        
        return new PatientAppointmentStats(total, upcoming, completed, cancelled);
    }
    
    @Override
    public DoctorAppointmentStats getDoctorStats(Integer doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        long total = appointmentRepository.countByDoctor(doctor);
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

    @Override
    public DoctorPaymentAnalyticsDTO getDoctorPaymentAnalytics(Integer doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        if (doctor.getRole() != UserRole.DOCTOR) {
            throw new IllegalArgumentException("User is not a doctor");
        }

        List<PaymentRecord> paidRecords = paymentRecordRepository
                .findByDoctorIdAndStatusOrderByPaidAtDesc(doctor.getId(), PaymentStatus.PAID);

        double totalRevenue = paidRecords.stream()
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0)
                .sum();

        LocalDate nowDate = LocalDate.now();
        YearMonth thisMonth = YearMonth.from(nowDate);

        List<PaymentRecord> thisMonthPaid = paidRecords.stream()
                .filter(p -> p.getPaidAt() != null && YearMonth.from(p.getPaidAt().toLocalDate()).equals(thisMonth))
                .collect(Collectors.toList());

        double thisMonthRevenue = thisMonthPaid.stream()
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0)
                .sum();
        double thisMonthAvgFee = thisMonthPaid.isEmpty() ? 0.0 : thisMonthRevenue / thisMonthPaid.size();

        double onlineCompletedRevenue = paidRecords.stream()
                .filter(p -> String.valueOf(p.getVisitTypeSnapshot()).toUpperCase().contains("ONLINE"))
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0)
                .sum();
        double clinicCompletedRevenue = Math.max(0.0, totalRevenue - onlineCompletedRevenue);

        List<Appointment> doctorAppointments = appointmentRepository.findByDoctorOrderByAppointmentDateDescAppointmentTimeDesc(doctor);
        double expectedRevenue = doctorAppointments.stream()
                .filter(a -> {
                    String s = String.valueOf(a.getStatus()).toUpperCase();
                    return "PENDING".equals(s) || "CONFIRMED".equals(s);
                })
                .mapToDouble(a -> a.getConsultationFee() != null ? a.getConsultationFee() : 0.0)
                .sum();
        double cancelledAmount = doctorAppointments.stream()
                .filter(a -> "CANCELLED".equals(String.valueOf(a.getStatus()).toUpperCase()))
                .mapToDouble(a -> a.getConsultationFee() != null ? a.getConsultationFee() : 0.0)
                .sum();

        List<DoctorPaymentAnalyticsDTO.RevenuePointDTO> monthlyRevenue = new ArrayList<>();
        Map<String, Double> monthlyMap = new HashMap<>();
        for (int i = 5; i >= 0; i -= 1) {
            YearMonth ym = thisMonth.minusMonths(i);
            String key = String.format("%04d-%02d", ym.getYear(), ym.getMonthValue());
            monthlyMap.put(key, 0.0);
            monthlyRevenue.add(DoctorPaymentAnalyticsDTO.RevenuePointDTO.builder()
                    .key(key)
                    .label(ym.getMonth().name().substring(0, 1) + ym.getMonth().name().substring(1, 3).toLowerCase())
                    .revenue(0.0)
                    .build());
        }
        for (PaymentRecord p : paidRecords) {
            if (p.getPaidAt() == null) continue;
            LocalDate d = p.getPaidAt().toLocalDate();
            String key = String.format("%04d-%02d", d.getYear(), d.getMonthValue());
            if (monthlyMap.containsKey(key)) {
                monthlyMap.put(key, monthlyMap.get(key) + (p.getAmount() != null ? p.getAmount() : 0.0));
            }
        }
        double monthlyPeak = 1.0;
        monthlyRevenue = monthlyRevenue.stream().map(item -> {
            double value = monthlyMap.getOrDefault(item.getKey(), 0.0);
            return DoctorPaymentAnalyticsDTO.RevenuePointDTO.builder()
                    .key(item.getKey())
                    .label(item.getLabel())
                    .revenue(value)
                    .build();
        }).collect(Collectors.toList());
        for (DoctorPaymentAnalyticsDTO.RevenuePointDTO point : monthlyRevenue) {
            monthlyPeak = Math.max(monthlyPeak, point.getRevenue());
        }

        LocalDate weekStart = nowDate.minusDays(6);
        List<DoctorPaymentAnalyticsDTO.RevenuePointDTO> weeklyRevenue = new ArrayList<>();
        Map<String, Double> weeklyMap = new HashMap<>();
        for (int i = 0; i < 7; i += 1) {
            LocalDate day = weekStart.plusDays(i);
            String key = day.toString();
            String label = day.getDayOfWeek().name().substring(0, 1) + day.getDayOfWeek().name().substring(1, 3).toLowerCase();
            weeklyMap.put(key, 0.0);
            weeklyRevenue.add(DoctorPaymentAnalyticsDTO.RevenuePointDTO.builder()
                    .key(key)
                    .label(label)
                    .revenue(0.0)
                    .build());
        }
        for (PaymentRecord p : paidRecords) {
            if (p.getPaidAt() == null) continue;
            String key = p.getPaidAt().toLocalDate().toString();
            if (weeklyMap.containsKey(key)) {
                weeklyMap.put(key, weeklyMap.get(key) + (p.getAmount() != null ? p.getAmount() : 0.0));
            }
        }
        weeklyRevenue = weeklyRevenue.stream().map(item -> {
            double value = weeklyMap.getOrDefault(item.getKey(), 0.0);
            return DoctorPaymentAnalyticsDTO.RevenuePointDTO.builder()
                    .key(item.getKey())
                    .label(item.getLabel())
                    .revenue(value)
                    .build();
        }).collect(Collectors.toList());

        double weeklyPeak = 1.0;
        double weeklyTotalRevenue = 0.0;
        for (DoctorPaymentAnalyticsDTO.RevenuePointDTO point : weeklyRevenue) {
            weeklyPeak = Math.max(weeklyPeak, point.getRevenue());
            weeklyTotalRevenue += point.getRevenue();
        }
        double weeklyAverageRevenue = weeklyRevenue.isEmpty() ? 0.0 : (weeklyTotalRevenue / weeklyRevenue.size());

        double collectibleBase = totalRevenue + expectedRevenue;
        int collectionRate = collectibleBase > 0 ? (int) Math.round((totalRevenue / collectibleBase) * 100) : 0;

        List<DoctorPaymentAnalyticsDTO.RecentPaymentDTO> recentPaid = paidRecords.stream()
                .limit(6)
                .map(p -> DoctorPaymentAnalyticsDTO.RecentPaymentDTO.builder()
                        .id(p.getId())
                        .patientName(p.getPatientNameSnapshot())
                        .appointmentDate(p.getAppointmentDateSnapshot() != null ? p.getAppointmentDateSnapshot().toString() : "-")
                        .appointmentTime(p.getAppointmentTimeSnapshot() != null ? p.getAppointmentTimeSnapshot().toString() : "-")
                        .visitType(p.getVisitTypeSnapshot() != null ? p.getVisitTypeSnapshot() : "clinic visit")
                        .consultationFee(p.getAmount() != null ? p.getAmount() : 0.0)
                        .paymentMethod(p.getMethod() != null ? p.getMethod().name() : "CASH")
                        .paidAt(p.getPaidAt() != null ? p.getPaidAt().toString() : "")
                        .build())
                .collect(Collectors.toList());

        return DoctorPaymentAnalyticsDTO.builder()
                .totalRevenue(totalRevenue)
                .expectedRevenue(expectedRevenue)
                .cancelledAmount(cancelledAmount)
                .thisMonthRevenue(thisMonthRevenue)
                .thisMonthAvgFee(thisMonthAvgFee)
                .onlineCompletedRevenue(onlineCompletedRevenue)
                .clinicCompletedRevenue(clinicCompletedRevenue)
                .collectionRate(collectionRate)
                .monthlyRevenue(monthlyRevenue)
                .monthlyPeak(monthlyPeak)
                .weeklyRevenue(weeklyRevenue)
                .weeklyPeak(weeklyPeak)
                .weeklyTotalRevenue(weeklyTotalRevenue)
                .weeklyAverageRevenue(weeklyAverageRevenue)
                .recentPaid(recentPaid)
                .build();
    }
    
    private AppointmentResponseDTO mapToResponseDTO(Appointment appointment) {
        PatientDetails patientDetails = appointment.getPatient() != null
                ? appointment.getPatient().getPatientDetails()
                : null;

        return AppointmentResponseDTO.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatient().getId())
                .patientName(appointment.getPatient().getName())
                .doctorId(appointment.getDoctor().getId())
                .doctorName(appointment.getDoctor().getName())
                .clinicAddress(
                appointment.getDoctor()
                    .getDoctorDetails()
                    .getClinicAddress()
            )
                .specialization(appointment.getDoctor().getDoctorDetails() != null ? 
                        appointment.getDoctor().getDoctorDetails().getSpecializationName() : null)
                .appointmentDate(appointment.getAppointmentDate())
                .appointmentTime(appointment.getAppointmentTime())
                .endTime(appointment.getEndTime())
                .status(appointment.getStatus())
                .reason(appointment.getReason())
                .symptoms(appointment.getSymptoms())
                .notes(appointment.getNotes())
                .durationOfSymptoms(appointment.getDurationOfSymptoms())
                .severity(appointment.getSeverity())
                .visitType(appointment.getVisitType())
                .bookingSource(appointment.getBookingSource())
                .parentAppointmentId(appointment.getParentAppointmentId())
                .patientSnapshotName(appointment.getPatientSnapshotName())
                .patientSnapshotAge(appointment.getPatientSnapshotAge())
                .patientSnapshotGender(appointment.getPatientSnapshotGender())
                .patientSnapshotBloodGroup(appointment.getPatientSnapshotBloodGroup())
                .patientSnapshotAllergies(appointment.getPatientSnapshotAllergies())
                .patientEmergencyContactName(
                        appointment.getPatientSnapshotEmergencyContactName() != null
                                ? appointment.getPatientSnapshotEmergencyContactName()
                                : (patientDetails != null ? patientDetails.getEmergencyContactName() : null)
                )
                .patientEmergencyContactPhone(
                        appointment.getPatientSnapshotEmergencyContactPhone() != null
                                ? appointment.getPatientSnapshotEmergencyContactPhone()
                                : (patientDetails != null ? patientDetails.getEmergencyContactPhone() : null)
                )
                .consultationFee(appointment.getConsultationFee())
                // .prescription(appointment.getPrescription())
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

    private DoctorReviewDTO mapToDoctorReviewDTO(Appointment appointment) {
        LocalDateTime reviewedAt = appointment.getUpdatedAt() != null
                ? appointment.getUpdatedAt()
                : (appointment.getCompletedAt() != null ? appointment.getCompletedAt() : appointment.getCreatedAt());
        return DoctorReviewDTO.builder()
                .appointmentId(appointment.getId())
                .patientId(appointment.getPatient() != null ? appointment.getPatient().getId() : null)
                .patientName(appointment.getPatient() != null ? appointment.getPatient().getName() : null)
                .doctorId(appointment.getDoctor() != null ? appointment.getDoctor().getId() : null)
                .doctorName(appointment.getDoctor() != null ? appointment.getDoctor().getName() : null)
                .rating(appointment.getRating())
                .feedback(appointment.getFeedback())
                .appointmentDate(appointment.getAppointmentDate())
                .reviewedAt(reviewedAt)
                .build();
    }
}

