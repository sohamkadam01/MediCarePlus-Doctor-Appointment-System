package com.medicareplus.Service;

import com.medicareplus.Models.PatientVital;
import com.medicareplus.DTO.PatientVitalDTO;

import java.time.LocalDateTime;
import java.util.List;

public interface PatientVitalService {
    PatientVital saveVitals(PatientVitalDTO vitalDTO);
    List<PatientVital> getPatientVitals(Integer patientId);
    PatientVital getLatestVitals(Integer patientId);
    List<PatientVital> getPatientVitalsByDateRange(Integer patientId, LocalDateTime startDate, LocalDateTime endDate);
    void deletePatientVitals(Long vitalId);
}
