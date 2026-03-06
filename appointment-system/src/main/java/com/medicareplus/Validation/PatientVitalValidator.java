package com.medicareplus.Validation;

import com.medicareplus.DTO.PatientVitalDTO;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class PatientVitalValidator {

    public List<String> validate(PatientVitalDTO vital) {
        List<String> errors = new ArrayList<>();

        // Blood Pressure validation
        if (vital.getSystolicBp() != null || vital.getDiastolicBp() != null) {
            if (vital.getSystolicBp() == null) {
                errors.add("Systolic BP is required when diastolic BP is provided");
            }
            if (vital.getDiastolicBp() == null) {
                errors.add("Diastolic BP is required when systolic BP is provided");
            }
            if (vital.getSystolicBp() != null && (vital.getSystolicBp() < 70 || vital.getSystolicBp() > 250)) {
                errors.add("Systolic BP must be between 70 and 250 mmHg");
            }
            if (vital.getDiastolicBp() != null && (vital.getDiastolicBp() < 40 || vital.getDiastolicBp() > 150)) {
                errors.add("Diastolic BP must be between 40 and 150 mmHg");
            }
        }

        // Heart Rate validation
        if (vital.getHeartRate() != null && (vital.getHeartRate() < 30 || vital.getHeartRate() > 250)) {
            errors.add("Heart rate must be between 30 and 250 bpm");
        }

        // SpO2 validation
        if (vital.getSpo2() != null && (vital.getSpo2() < 50 || vital.getSpo2() > 100)) {
            errors.add("SpO2 must be between 50% and 100%");
        }

        // Temperature validation
        if (vital.getTemperature() != null && (vital.getTemperature() < 30 || vital.getTemperature() > 45)) {
            errors.add("Temperature must be between 30°C and 45°C");
        }

        // Weight validation
        if (vital.getWeight() != null && (vital.getWeight() < 1 || vital.getWeight() > 300)) {
            errors.add("Weight must be between 1 kg and 300 kg");
        }

        // Blood Sugar validation
        if (vital.getBloodSugar() != null && (vital.getBloodSugar() < 20 || vital.getBloodSugar() > 600)) {
            errors.add("Blood sugar must be between 20 mg/dL and 600 mg/dL");
        }

        return errors;
    }
}