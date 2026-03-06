// VerificationResponseDTO.java
package com.medicareplus.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VerificationResponseDTO {
    private boolean exists;
    private String message;
    private PatientInfoDTO patientInfo;
}