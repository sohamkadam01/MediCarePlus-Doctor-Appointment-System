package com.medicareplus.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.medicareplus.DTO.LabAnalysisDTO;
import com.medicareplus.DTO.LabAppointmentRequestDTO;
import com.medicareplus.DTO.LabDashboardAppointmentDTO;
import com.medicareplus.DTO.LabInstrumentStatusDTO;
import com.medicareplus.DTO.LabMetricDTO;
import com.medicareplus.DTO.LabPatientAppointmentDTO;
import com.medicareplus.Models.Lab;
import com.medicareplus.Models.LabAppointment;
import com.medicareplus.Models.LabAppointmentStatus;
import com.medicareplus.Models.LabTest;
import com.medicareplus.Repository.LabAppointmentRepository;
import com.medicareplus.Repository.LabRepository;
import com.medicareplus.Repository.LabTestRepository;

@Service
public class LabAppointmentServiceImpl implements LabAppointmentService {
    private final LabAppointmentRepository labAppointmentRepository;
    private final LabRepository labRepository;
    private final LabTestRepository labTestRepository;

    public LabAppointmentServiceImpl(
            LabAppointmentRepository labAppointmentRepository,
            LabRepository labRepository,
            LabTestRepository labTestRepository) {
        this.labAppointmentRepository = labAppointmentRepository;
        this.labRepository = labRepository;
        this.labTestRepository = labTestRepository;
    }

    @Override
    public Long bookLabAppointment(LabAppointmentRequestDTO request) {
        LocalDateTime now = LocalDateTime.now();
        LocalTime scheduledTime = now.toLocalTime().withSecond(0).withNano(0);

        Integer labId = request.getLabId();
        if (labId == null && request.getLabEmail() != null) {
            labId = labRepository.findByEmail(request.getLabEmail())
                    .map(Lab::getId)
                    .orElse(null);
        }

        LabAppointment appointment = LabAppointment.builder()
                .labId(labId)
                .labName(request.getLabName())
                .labEmail(request.getLabEmail())
                .labPhone(request.getLabPhone())
                .labAddress(request.getLabAddress())
                .labCity(request.getLabCity())
                .labState(request.getLabState())
                .labPincode(request.getLabPincode())
                .testName(request.getTestName())
                .testPrice(request.getTestPrice())
                .preparation(request.getPreparation())
                .turnaroundHours(parseTurnaroundHours(request.getTurnaround()))
                .referralType(request.getReferralType())
                .patientId(request.getPatientId())
                .patientName(request.getPatientName())
                .patientPhone(request.getPatientPhone())
                .patientEmail(request.getPatientEmail())
                .patientAge(request.getPatientAge())
                .patientGender(request.getPatientGender())
                .bookingSource(request.getBookingSource())
                .status(parseStatus(request.getBookingStatus()))
                .priority(derivePriority(request))
                .appointmentDate(now.toLocalDate())
                .appointmentTime(scheduledTime)
                .createdAt(now)
                .updatedAt(now)
                .build();

        return labAppointmentRepository.save(appointment).getId();
    }

    @Override
    public List<LabDashboardAppointmentDTO> getLabAppointmentsForDate(String labEmail, LocalDate date) {
        return labAppointmentRepository
                .findByLabEmailIgnoreCaseAndAppointmentDateOrderByAppointmentTimeAsc(labEmail, date)
                .stream()
                .map(this::toDashboardAppointment)
                .collect(Collectors.toList());
    }

    @Override
    public void updateLabAppointmentStatus(Long appointmentId, String status) {
        LabAppointment appointment = labAppointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Lab appointment not found"));
        appointment.setStatus(parseStatus(status));
        appointment.setUpdatedAt(LocalDateTime.now());
        labAppointmentRepository.save(appointment);
    }

    @Override
    public List<LabAnalysisDTO> getActiveAnalyses(String labEmail) {
        List<LabAppointmentStatus> activeStatuses = List.of(
                LabAppointmentStatus.CONFIRMED,
                LabAppointmentStatus.CHECKED_IN,
                LabAppointmentStatus.IN_PROGRESS);

        return labAppointmentRepository.findByLabEmailIgnoreCaseAndStatusIn(labEmail, activeStatuses)
                .stream()
                .sorted(Comparator.comparing(LabAppointment::getAppointmentTime, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::toAnalysis)
                .collect(Collectors.toList());
    }

    @Override
    public List<LabMetricDTO> getQualityMetrics(String labEmail, LocalDate date) {
        long totalToday = labAppointmentRepository.countByLabEmailIgnoreCaseAndAppointmentDate(labEmail, date);
        long completed = labAppointmentRepository.countByLabEmailIgnoreCaseAndAppointmentDateAndStatus(
                labEmail, date, LabAppointmentStatus.COMPLETED);
        long pending = labAppointmentRepository.countByLabEmailIgnoreCaseAndAppointmentDateAndStatus(
                labEmail, date, LabAppointmentStatus.PENDING);

        int avgTurnaround = labAppointmentRepository
                .findByLabEmailIgnoreCaseAndAppointmentDateOrderByAppointmentTimeAsc(labEmail, date)
                .stream()
                .map(LabAppointment::getTurnaroundHours)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .boxed()
                .collect(Collectors.collectingAndThen(Collectors.toList(), values -> {
                    if (values.isEmpty()) return 0;
                    int sum = values.stream().mapToInt(Integer::intValue).sum();
                    return Math.round(sum / (float) values.size());
                }));

        return List.of(
                LabMetricDTO.builder()
                        .name("Total Tests")
                        .value(String.valueOf(totalToday))
                        .unit("today")
                        .status(totalToday > 0 ? "good" : "optimal")
                        .trend(totalToday > 0 ? "+today" : "steady")
                        .build(),
                LabMetricDTO.builder()
                        .name("Pending")
                        .value(String.valueOf(pending))
                        .unit("tests")
                        .status(pending > 5 ? "alert" : "good")
                        .trend(pending > 0 ? "pending" : "clear")
                        .build(),
                LabMetricDTO.builder()
                        .name("Completed")
                        .value(String.valueOf(completed))
                        .unit("tests")
                        .status(completed > 0 ? "optimal" : "good")
                        .trend(completed > 0 ? "up" : "steady")
                        .build(),
                LabMetricDTO.builder()
                        .name("Avg Turnaround")
                        .value(String.valueOf(avgTurnaround))
                        .unit("hrs")
                        .status(avgTurnaround > 0 && avgTurnaround <= 24 ? "optimal" : "good")
                        .trend(avgTurnaround > 0 ? "stable" : "n/a")
                        .build()
        );
    }

    @Override
    public List<LabInstrumentStatusDTO> getInstrumentStatus(Integer labId) {
        if (labId == null) {
            return List.of();
        }
        List<LabTest> tests = labTestRepository.findByLabId(labId);
        return tests.stream()
                .map(test -> LabInstrumentStatusDTO.builder()
                        .name(test.getTestName())
                        .status("online")
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<LabPatientAppointmentDTO> getLabAppointments(String labEmail) {
        if (labEmail == null || labEmail.isBlank()) {
            return List.of();
        }
        return labAppointmentRepository
                .findByLabEmailIgnoreCaseOrderByAppointmentDateDescAppointmentTimeDesc(labEmail)
                .stream()
                .map(this::toPatientAppointment)
                .collect(Collectors.toList());
    }

    @Override
    public List<LabPatientAppointmentDTO> getPatientAppointments(Integer patientId, String patientEmail) {
        if (patientId == null && (patientEmail == null || patientEmail.isBlank())) {
            return List.of();
        }
        return labAppointmentRepository
                .findByPatientIdOrPatientEmailIgnoreCaseOrderByAppointmentDateDescAppointmentTimeDesc(
                        patientId, patientEmail)
                .stream()
                .map(this::toPatientAppointment)
                .collect(Collectors.toList());
    }

    @Override
    public LabPatientAppointmentDTO cancelPatientAppointment(Integer patientId, String patientEmail, Long appointmentId) {
        LabAppointment appointment = labAppointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Lab appointment not found"));
        boolean patientIdMatches = patientId != null && appointment.getPatientId() != null
                && appointment.getPatientId().equals(patientId);
        boolean patientEmailMatches = patientEmail != null
                && appointment.getPatientEmail() != null
                && appointment.getPatientEmail().equalsIgnoreCase(patientEmail);
        if (!patientIdMatches && !patientEmailMatches) {
            throw new RuntimeException("Access denied");
        }
        appointment.setStatus(LabAppointmentStatus.CANCELLED);
        appointment.setUpdatedAt(LocalDateTime.now());
        return toPatientAppointment(labAppointmentRepository.save(appointment));
    }

    private LabDashboardAppointmentDTO toDashboardAppointment(LabAppointment appointment) {
        return LabDashboardAppointmentDTO.builder()
                .id(appointment.getId())
                .patientName(appointment.getPatientName())
                .mrn("LAB-" + appointment.getId())
                .testName(appointment.getTestName())
                .scheduledTime(appointment.getAppointmentTime() != null
                        ? appointment.getAppointmentTime().toString()
                        : "-")
                .doctorName(appointment.getReferralType() != null
                        && appointment.getReferralType().equalsIgnoreCase("doctor")
                        ? "Doctor Referral"
                        : "Self")
                .priority(appointment.getPriority() != null ? appointment.getPriority() : "routine")
                .status(appointment.getStatus() != null
                        ? appointment.getStatus().name().toLowerCase(Locale.ROOT)
                        : "pending")
                .build();
    }

    private LabAnalysisDTO toAnalysis(LabAppointment appointment) {
        return LabAnalysisDTO.builder()
                .id(appointment.getId())
                .patientName(appointment.getPatientName())
                .testName(appointment.getTestName())
                .progress(progressFromStatus(appointment.getStatus()))
                .startedTime(appointment.getAppointmentTime() != null
                        ? appointment.getAppointmentTime().toString()
                        : "-")
                .instrument(appointment.getTestName() != null ? appointment.getTestName() : "Lab Analyzer")
                .build();
    }

    private int progressFromStatus(LabAppointmentStatus status) {
        if (status == null) return 15;
        return switch (status) {
            case CONFIRMED -> 25;
            case CHECKED_IN -> 45;
            case IN_PROGRESS -> 70;
            case COMPLETED -> 100;
            default -> 15;
        };
    }

    private String derivePriority(LabAppointmentRequestDTO request) {
        if (Boolean.TRUE.equals(request.getEmergencyServices())) {
            return "urgent";
        }
        if (Boolean.TRUE.equals(request.getHomeCollection())) {
            return "high";
        }
        return "routine";
    }

    private LabPatientAppointmentDTO toPatientAppointment(LabAppointment appointment) {
        return LabPatientAppointmentDTO.builder()
                .id(appointment.getId())
                .appointmentType("LAB")
                .appointmentDate(appointment.getAppointmentDate())
                .appointmentTime(appointment.getAppointmentTime())
                .status(appointment.getStatus())
                .labId(appointment.getLabId())
                .labName(appointment.getLabName())
                .labEmail(appointment.getLabEmail())
                .labPhone(appointment.getLabPhone())
                .labAddress(appointment.getLabAddress())
                .labCity(appointment.getLabCity())
                .labState(appointment.getLabState())
                .labPincode(appointment.getLabPincode())
                .testName(appointment.getTestName())
                .testPrice(appointment.getTestPrice())
                .referralType(appointment.getReferralType())
                .patientId(appointment.getPatientId())
                .patientName(appointment.getPatientName())
                .patientEmail(appointment.getPatientEmail())
                .patientPhone(appointment.getPatientPhone())
                .bookingSource(appointment.getBookingSource())
                .build();
    }

    private LabAppointmentStatus parseStatus(String status) {
        if (status == null || status.isBlank()) return LabAppointmentStatus.PENDING;
        String normalized = status.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "CONFIRMED" -> LabAppointmentStatus.CONFIRMED;
            case "CHECKED_IN", "CHECKED-IN" -> LabAppointmentStatus.CHECKED_IN;
            case "IN_PROGRESS", "IN-PROGRESS" -> LabAppointmentStatus.IN_PROGRESS;
            case "COMPLETED" -> LabAppointmentStatus.COMPLETED;
            case "CANCELLED", "CANCELED" -> LabAppointmentStatus.CANCELLED;
            default -> LabAppointmentStatus.PENDING;
        };
    }

    private Integer parseTurnaroundHours(String turnaround) {
        if (turnaround == null || turnaround.isBlank()) return null;
        String digits = turnaround.replaceAll("[^0-9]", "");
        if (digits.isBlank()) return null;
        try {
            return Integer.parseInt(digits);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
