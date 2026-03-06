package com.medicareplus.DTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LabMetricDTO {
    private String name;
    private String value;
    private String unit;
    private String status;
    private String trend;
}
