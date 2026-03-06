package com.medicareplus.Service;

import java.time.LocalDate;
import java.util.List;

import com.medicareplus.DTO.LabAnalysisDTO;
import com.medicareplus.DTO.LabAppointmentRequestDTO;
import com.medicareplus.DTO.LabDashboardAppointmentDTO;
import com.medicareplus.DTO.LabInstrumentStatusDTO;
import com.medicareplus.DTO.LabMetricDTO;
import com.medicareplus.DTO.LabPatientAppointmentDTO;

public interface LabAppointmentService {
    Long bookLabAppointment(LabAppointmentRequestDTO request);

    List<LabDashboardAppointmentDTO> getLabAppointmentsForDate(String labEmail, LocalDate date);

    void updateLabAppointmentStatus(Long appointmentId, String status);

    List<LabAnalysisDTO> getActiveAnalyses(String labEmail);

    List<LabMetricDTO> getQualityMetrics(String labEmail, LocalDate date);

    List<LabInstrumentStatusDTO> getInstrumentStatus(Integer labId);

    List<LabPatientAppointmentDTO> getLabAppointments(String labEmail);

    List<LabPatientAppointmentDTO> getPatientAppointments(Integer patientId, String patientEmail);

    LabPatientAppointmentDTO cancelPatientAppointment(Integer patientId, String patientEmail, Long appointmentId);
}
