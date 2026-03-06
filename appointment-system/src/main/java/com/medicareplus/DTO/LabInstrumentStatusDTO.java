package com.medicareplus.DTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LabInstrumentStatusDTO {
    private String name;
    private String status;
}
