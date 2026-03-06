package com.medicareplus.DTO;


import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PatientVitalDTO {
    private Integer patientId;
    private LocalDateTime recordedAt;
    private Integer systolicBp;
    private Integer diastolicBp;
    private Integer heartRate;
    private Integer spo2;
    private Double temperature;
    private Double weight;
    private Double bloodSugar;
    private String notes;
}
