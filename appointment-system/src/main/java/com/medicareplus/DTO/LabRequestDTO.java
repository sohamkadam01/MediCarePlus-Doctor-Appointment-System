package com.medicareplus.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LabRequestDTO {
    @NotBlank(message = "Lab name is required")
    private String name;

    @NotBlank(message = "Lab address is required")
    private String address;

    @NotBlank(message = "Lab contact is required")
    private String contact;
}
