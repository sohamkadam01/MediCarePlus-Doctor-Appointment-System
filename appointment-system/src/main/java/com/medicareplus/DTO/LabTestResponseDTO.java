package com.medicareplus.DTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LabTestResponseDTO {
    private Integer id;
    private String testName;
    private Double price;
    private String description;
    private Integer labId;
}
