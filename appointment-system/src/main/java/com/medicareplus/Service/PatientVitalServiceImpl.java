package com.medicareplus.Service;

import com.medicareplus.Models.PatientVital;
import com.medicareplus.Models.User;
import com.medicareplus.Repository.PatientVitalRepository;
import com.medicareplus.Repository.UserRepository;
import com.medicareplus.Service.PatientVitalService;
import com.medicareplus.DTO.PatientVitalDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientVitalServiceImpl implements PatientVitalService {

    @Autowired
    private PatientVitalRepository patientVitalRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public PatientVital saveVitals(PatientVitalDTO vitalDTO) {
        // Find the patient
        User patient = userRepository.findById(vitalDTO.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + vitalDTO.getPatientId()));

        // Create new vital record
        PatientVital vital = PatientVital.builder()
                .patient(patient)
                .recordedAt(vitalDTO.getRecordedAt() != null ? vitalDTO.getRecordedAt() : LocalDateTime.now())
                .systolicBp(vitalDTO.getSystolicBp())
                .diastolicBp(vitalDTO.getDiastolicBp())
                .heartRate(vitalDTO.getHeartRate())
                .spo2(vitalDTO.getSpo2())
                .temperature(vitalDTO.getTemperature())
                .weight(vitalDTO.getWeight())
                .bloodSugar(vitalDTO.getBloodSugar())
                .notes(vitalDTO.getNotes())
                .build();

        return patientVitalRepository.save(vital);
    }

    @Override
    public List<PatientVital> getPatientVitals(Integer patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));
        
        return patientVitalRepository.findByPatientOrderByRecordedAtDesc(patient);
    }

    @Override
    public PatientVital getLatestVitals(Integer patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));
        
        return patientVitalRepository.findTopByPatientOrderByRecordedAtDesc(patient)
                .orElse(null);
    }

    @Override
    public List<PatientVital> getPatientVitalsByDateRange(Integer patientId, LocalDateTime startDate, LocalDateTime endDate) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));
        
        return patientVitalRepository.findByPatientAndRecordedAtBetweenOrderByRecordedAtDesc(
                patient, startDate, endDate);
    }

    @Override
    @Transactional
    public void deletePatientVitals(Long vitalId) {
        patientVitalRepository.deleteById(vitalId);
    }
}
