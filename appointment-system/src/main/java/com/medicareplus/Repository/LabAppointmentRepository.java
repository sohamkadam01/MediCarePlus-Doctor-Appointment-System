package com.medicareplus.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medicareplus.Models.LabAppointment;
import com.medicareplus.Models.LabAppointmentStatus;

@Repository
public interface LabAppointmentRepository extends JpaRepository<LabAppointment, Long> {
    List<LabAppointment> findByLabEmailIgnoreCaseAndAppointmentDateOrderByAppointmentTimeAsc(
            String labEmail, LocalDate appointmentDate);

    List<LabAppointment> findByLabEmailIgnoreCaseOrderByAppointmentDateDescAppointmentTimeDesc(String labEmail);

    List<LabAppointment> findByLabEmailIgnoreCaseAndStatusIn(
            String labEmail, List<LabAppointmentStatus> statuses);

    long countByLabEmailIgnoreCaseAndAppointmentDate(String labEmail, LocalDate appointmentDate);

    long countByLabEmailIgnoreCaseAndAppointmentDateAndStatus(
            String labEmail, LocalDate appointmentDate, LabAppointmentStatus status);

    List<LabAppointment> findByPatientIdOrderByAppointmentDateDescAppointmentTimeDesc(Integer patientId);

    List<LabAppointment> findByPatientIdOrPatientEmailIgnoreCaseOrderByAppointmentDateDescAppointmentTimeDesc(
            Integer patientId, String patientEmail);

    List<LabAppointment> findByAppointmentDateBetween(LocalDate startDate, LocalDate endDate);

    List<LabAppointment> findByCreatedAtBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);
}
