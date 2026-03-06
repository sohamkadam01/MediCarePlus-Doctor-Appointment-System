package com.medicareplus.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class LabTestRequestDTO {
    @NotBlank(message = "Test name is required")
    private String testName;

    @NotNull(message = "Price is required")
    @PositiveOrZero(message = "Price must be zero or positive")
    private Double price;

    @NotBlank(message = "Description is required")
    private String description;
}
