package com.medicareplus.DTO;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDetailsRequestDTO {
    
    @NotNull(message = "Specialization ID is required")
    @JsonProperty("specialization_id") 
    private Long specializationId;  // This matches frontend
    
    @NotNull(message = "Experience years is required")
    @Min(value = 0, message = "Experience years cannot be negative")
    @JsonProperty("experience_year") 
    private Integer experienceYear;
    
    @NotBlank(message = "Clinic address is required")
    @JsonProperty("clinic_address") 
    private String clinicAddress;
    
    @NotBlank(message = "Qualification is required")
    @JsonProperty("qualification") 
    private String qualification;
    
   

    private String bio;
    
    @NotNull(message = "Consultation fee is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Consultation fee must be greater than 0")
    @JsonProperty("consultation_fee") 
    private BigDecimal consultationFee;
    
    private String licenseCertificateUrl;
}